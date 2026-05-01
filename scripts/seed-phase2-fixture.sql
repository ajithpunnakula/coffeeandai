-- Phase 2 live-verification fixture: a "demo-topic" with 3 level variants.
-- Lets /browse render a topic-tile with three level pills end-to-end.
-- Idempotent: re-running is safe.

INSERT INTO content.courses (
  id, slug, title, summary, status, estimated_minutes, pass_threshold,
  domains, level, topic_key, published_at
) VALUES
  ('demo-topic-basic', 'demo-topic-basic', 'Demo Topic — Basic',
   'Phase 2 fixture: basic-level variant of demo-topic.', 'published',
   30, 0.7, '[]'::jsonb, 'basic', 'demo-topic', now()),
  ('demo-topic-intermediate', 'demo-topic-intermediate', 'Demo Topic — Intermediate',
   'Phase 2 fixture: intermediate-level variant of demo-topic.', 'published',
   45, 0.7, '[]'::jsonb, 'intermediate', 'demo-topic', now()),
  ('demo-topic-advanced', 'demo-topic-advanced', 'Demo Topic — Advanced',
   'Phase 2 fixture: advanced-level variant of demo-topic.', 'published',
   60, 0.7, '[]'::jsonb, 'advanced', 'demo-topic', now())
ON CONFLICT (slug) DO UPDATE SET
  level = EXCLUDED.level,
  topic_key = EXCLUDED.topic_key,
  status = 'published';

-- A trivial page card per variant so /courses/[slug] doesn't 404.
INSERT INTO content.cards (
  id, course_slug, card_type, ord, difficulty, title, body_md, domain
) VALUES
  ('demo-topic-basic-c1', 'demo-topic-basic', 'page', 0, 0,
   'Welcome', 'Demo content for the basic variant.', 'general'),
  ('demo-topic-intermediate-c1', 'demo-topic-intermediate', 'page', 0, 1,
   'Welcome', 'Demo content for the intermediate variant.', 'general'),
  ('demo-topic-advanced-c1', 'demo-topic-advanced', 'page', 0, 2,
   'Welcome', 'Demo content for the advanced variant.', 'general')
ON CONFLICT (id) DO NOTHING;

UPDATE content.courses SET card_order = ARRAY['demo-topic-basic-c1']::TEXT[]
  WHERE slug = 'demo-topic-basic';
UPDATE content.courses SET card_order = ARRAY['demo-topic-intermediate-c1']::TEXT[]
  WHERE slug = 'demo-topic-intermediate';
UPDATE content.courses SET card_order = ARRAY['demo-topic-advanced-c1']::TEXT[]
  WHERE slug = 'demo-topic-advanced';
