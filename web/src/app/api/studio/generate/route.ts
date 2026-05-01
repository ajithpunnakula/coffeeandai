import { requireAuthor, AuthError } from "@/lib/auth-guards";
import { getDb } from "@/lib/db";
import {
  planCourse,
  generateCardContent,
  validateCard,
  saveDraftCard,
} from "@/lib/course-generator";
import { slugify } from "@/lib/draft-db";

export async function POST(request: Request) {
  try {
    const user = await requireAuthor();
    const { topic, slug: requestedSlug, wikiRefs, examTarget } =
      await request.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slug = requestedSlug || slugify(topic);
    const sql = getDb();

    // Check if draft already exists
    const existing = await sql`
      SELECT 1 FROM content.course_drafts WHERE slug = ${slug}
    `;
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "A draft with this slug already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }

    // Load wiki content if refs provided
    let wikiContent: string | null = null;
    if (wikiRefs && Array.isArray(wikiRefs) && wikiRefs.length > 0) {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const snippets: string[] = [];
        for (const ref of wikiRefs.slice(0, 5)) {
          const filePath = path.resolve(process.cwd(), "..", ref);
          try {
            const content = await fs.readFile(filePath, "utf-8");
            snippets.push(`## ${ref}\n${content.slice(0, 2000)}`);
          } catch {
            // Skip missing files
          }
        }
        if (snippets.length > 0) {
          wikiContent = snippets.join("\n\n");
        }
      } catch {
        // fs not available in edge runtime — skip wiki loading
      }
    }

    // Stream progress as SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(data: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        }

        try {
          // Phase 1: Plan the course
          send({ phase: "planning", progress: { current: 0, total: 0 } });

          const plan = await planCourse(topic, wikiContent, examTarget);

          send({
            phase: "planned",
            plan: {
              title: plan.title,
              cardCount: plan.cards.length,
              domains: plan.domains,
            },
            progress: { current: 0, total: plan.cards.length },
          });

          // Create draft course
          await sql`
            INSERT INTO content.course_drafts (
              slug, title, summary, exam_target, estimated_minutes,
              pass_threshold, domains, card_order, created_by
            ) VALUES (
              ${slug}, ${plan.title}, ${plan.summary}, ${examTarget ?? null},
              ${plan.estimated_minutes}, ${plan.pass_threshold},
              ${JSON.stringify(plan.domains)}, '{}', ${user.id}
            )
          `;

          // Phase 2: Generate cards one by one
          const cardIds: string[] = [];

          for (let i = 0; i < plan.cards.length; i++) {
            const spec = plan.cards[i];
            send({
              phase: "generating",
              card: spec.title,
              progress: { current: i, total: plan.cards.length },
            });

            const { body_md, metadata } = await generateCardContent(spec, {
              title: plan.title,
              topic,
              domains: plan.domains,
            });

            // Validate
            const validation = validateCard(spec.card_type, metadata);
            if (!validation.valid) {
              send({
                phase: "validation_warning",
                card: spec.title,
                errors: validation.errors,
              });
            }

            // Save to draft
            const cardId = await saveDraftCard(slug, {
              title: spec.title,
              card_type: spec.card_type,
              domain: spec.domain,
              difficulty: spec.difficulty,
              body_md,
              metadata,
              ord: i,
            });
            cardIds.push(cardId);

            send({
              phase: "card_complete",
              card: spec.title,
              cardId,
              progress: { current: i + 1, total: plan.cards.length },
            });
          }

          // Update card_order
          await sql`
            UPDATE content.course_drafts
            SET card_order = ${cardIds}, updated_at = now()
            WHERE slug = ${slug}
          `;

          send({
            phase: "complete",
            slug,
            progress: { current: plan.cards.length, total: plan.cards.length },
          });
        } catch (err) {
          send({
            phase: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("POST /api/studio/generate error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
