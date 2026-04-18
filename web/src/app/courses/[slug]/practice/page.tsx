import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { notFound } from "next/navigation";
import PracticeClient from "./PracticeClient";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export default async function PracticePage({
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
    SELECT title FROM content.courses WHERE slug = ${slug} LIMIT 1
  `;
  if (!courseRows[0]) return notFound();

  // Get learner profile for weak concepts
  const userRows = await sql`
    SELECT id FROM learner.users WHERE clerk_id = ${userId} LIMIT 1
  `;

  let weakConcepts: string[] = [];
  if (userRows[0]) {
    const profileRows = await sql`
      SELECT weak_concepts FROM learner.profiles
      WHERE user_id = ${userRows[0].id} AND course_slug = ${slug}
      LIMIT 1
    `;
    weakConcepts = profileRows[0]?.weak_concepts ?? [];
  }

  return (
    <PracticeClient
      courseSlug={slug}
      courseTitle={courseRows[0].title}
      weakConcepts={weakConcepts}
    />
  );
}
