-- Phase 3 live-verification fixture: a published "demo-path" using the
-- demo-topic courses already seeded by scripts/seed-phase2-fixture.sql.
-- Idempotent: re-running is safe.

INSERT INTO content.learning_paths (
  id, slug, title, summary, audience, level, status, estimated_minutes,
  created_at, published_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'demo-path',
  'Demo Path',
  'Phase 3 fixture: a 3-course path (basic → intermediate → advanced) for live gating verification.',
  'curious learners',
  'intermediate',
  'published',
  135,
  now(),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  audience = EXCLUDED.audience,
  level = EXCLUDED.level,
  status = 'published',
  estimated_minutes = EXCLUDED.estimated_minutes,
  published_at = now();

-- Wire the three demo-topic courses into the path (basic and intermediate
-- required, advanced optional) so gating is observable.
DELETE FROM content.learning_path_courses
  WHERE path_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO content.learning_path_courses (path_id, course_id, position, required)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo-topic-basic',        1, TRUE),
  ('11111111-1111-1111-1111-111111111111', 'demo-topic-intermediate', 2, TRUE),
  ('11111111-1111-1111-1111-111111111111', 'demo-topic-advanced',     3, FALSE);
