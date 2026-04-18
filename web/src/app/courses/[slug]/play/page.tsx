import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import CardPlayer from "@/components/CardPlayer";
import { getAdaptiveOrder } from "@/lib/adaptive-router";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sql = getDb();

  const courseRows = await sql`
    SELECT id FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  const course = courseRows[0];
  if (!course) return notFound();

  // Fetch cards, learner profile, and completed cards in parallel
  const [cards, userRows] = await Promise.all([
    sql`
      SELECT c.id, c.card_type, c.title, c.body_md,
             c.domain, c.metadata,
             c.image_url, c.audio_url, c.ord
      FROM content.cards c
      WHERE c.course_slug = ${slug}
      ORDER BY c.ord ASC
    `,
    sql`SELECT id FROM learner.users WHERE clerk_id = ${userId} LIMIT 1`,
  ]);

  const dbUserId = userRows[0]?.id;

  // Fetch profile + completed cards if user exists
  let profile = null;
  const completedCardIds = new Set<string>();

  if (dbUserId) {
    const [profileRows, progressRows] = await Promise.all([
      sql`
        SELECT domain_mastery, weak_concepts, summary_md
        FROM learner.profiles
        WHERE user_id = ${dbUserId} AND course_slug = ${slug}
        LIMIT 1
      `,
      sql`
        SELECT card_id FROM learner.card_progress
        WHERE user_id = ${dbUserId} AND status = 'completed'
      `,
    ]);

    if (profileRows[0]) {
      const p = profileRows[0];
      profile = {
        domain_mastery: (typeof p.domain_mastery === "string"
          ? JSON.parse(p.domain_mastery)
          : p.domain_mastery) ?? {},
        weak_concepts: p.weak_concepts ?? [],
        summary_md: p.summary_md ?? "",
      };
    }

    for (const row of progressRows) {
      completedCardIds.add(String(row.card_id));
    }
  }

  const mappedCards = cards.map((c) => {
    const meta = (typeof c.metadata === "string" ? JSON.parse(c.metadata) : c.metadata) ?? {};
    return {
      id: String(c.id),
      card_type: c.card_type,
      title: c.title,
      body_md: c.body_md,
      domain: c.domain,
      metadata: meta,
      image_url: c.image_url,
      audio_url: c.audio_url,
    };
  });

  // Apply adaptive ordering based on learner profile
  const orderedCards = getAdaptiveOrder(mappedCards, profile, completedCardIds);

  return (
    <CardPlayer
      cards={orderedCards}
      courseSlug={slug}
      learnerProfile={profile}
      initialCompletedCards={[...completedCardIds]}
    />
  );
}
