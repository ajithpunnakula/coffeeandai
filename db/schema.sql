-- Content tables (CI-writable only)
CREATE SCHEMA IF NOT EXISTS content;

CREATE TABLE IF NOT EXISTS content.courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT DEFAULT 'draft',
  exam_target TEXT,
  target_audience TEXT,
  estimated_minutes INT,
  pass_threshold REAL,
  domains JSONB,
  wiki_refs TEXT[],
  card_order TEXT[],
  tags TEXT[],
  source_hash TEXT,
  git_commit TEXT,
  published_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content.cards (
  id TEXT PRIMARY KEY,
  course_slug TEXT NOT NULL REFERENCES content.courses(slug),
  card_type TEXT NOT NULL,
  ord INT NOT NULL,
  difficulty INT,
  title TEXT NOT NULL,
  body_md TEXT,
  domain TEXT,
  metadata JSONB,
  wiki_refs TEXT[],
  image_url TEXT,
  audio_url TEXT,
  source TEXT,
  content_hashes JSONB,
  source_hash TEXT
);

CREATE TABLE IF NOT EXISTS content.graphs (
  course_slug TEXT NOT NULL REFERENCES content.courses(slug),
  concept TEXT NOT NULL,
  prerequisites TEXT[],
  domain TEXT,
  wiki_page TEXT,
  PRIMARY KEY (course_slug, concept)
);

CREATE TABLE IF NOT EXISTS content.card_metrics (
  card_id TEXT PRIMARY KEY REFERENCES content.cards(id),
  attempts INT DEFAULT 0,
  pass_rate REAL,
  avg_attempts REAL,
  avg_time_seconds REAL,
  skip_rate REAL,
  misconception_hit_rates JSONB,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content.domain_metrics (
  course_slug TEXT NOT NULL,
  domain TEXT NOT NULL,
  avg_score REAL,
  weakest_concept TEXT,
  strongest_concept TEXT,
  sample_size INT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (course_slug, domain)
);

-- Learner tables (app-writable only)
CREATE SCHEMA IF NOT EXISTS learner;

CREATE TABLE IF NOT EXISTS learner.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT DEFAULT 'learner',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learner.enrollments (
  user_id UUID NOT NULL REFERENCES learner.users(id),
  course_slug TEXT NOT NULL REFERENCES content.courses(slug),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_slug)
);

CREATE TABLE IF NOT EXISTS learner.card_progress (
  user_id UUID NOT NULL REFERENCES learner.users(id),
  card_id TEXT NOT NULL REFERENCES content.cards(id),
  status TEXT DEFAULT 'not_started',
  score REAL,
  response JSONB,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS learner.card_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES learner.users(id),
  card_id TEXT NOT NULL REFERENCES content.cards(id),
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learner.completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES learner.users(id),
  course_slug TEXT NOT NULL REFERENCES content.courses(slug),
  score REAL,
  passed BOOLEAN,
  domain_scores JSONB,
  completed_at TIMESTAMPTZ DEFAULT now(),
  certificate_hash TEXT
);

CREATE TABLE IF NOT EXISTS learner.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  course_slug TEXT,
  card_id TEXT,
  role TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learner.profiles (
  user_id UUID NOT NULL,
  course_slug TEXT NOT NULL,
  summary_md TEXT,
  domain_mastery JSONB,
  weak_concepts TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, course_slug)
);
