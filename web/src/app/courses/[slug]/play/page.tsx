import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import CardPlayer from "@/components/CardPlayer";

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

  const cards = await sql`
    SELECT c.id, c.card_type, c.title, c.body_md,
           c.domain, c.metadata,
           c.image_url, c.audio_url, c.ord
    FROM content.cards c
    WHERE c.course_slug = ${slug}
    ORDER BY c.ord ASC
  `;

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

  return <CardPlayer cards={mappedCards} courseSlug={slug} />;
}
