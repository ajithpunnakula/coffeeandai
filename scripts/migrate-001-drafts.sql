-- Migration 001: Draft tables, version history, and edit audit
-- Idempotent — safe to run multiple times

-- Draft tables (developer-writable, mutable)

CREATE TABLE IF NOT EXISTS content.course_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  exam_target TEXT,
  target_audience TEXT,
  estimated_minutes INT,
  pass_threshold REAL,
  domains JSONB,
  wiki_refs TEXT[],
  card_order TEXT[],
  tags TEXT[],
  created_by UUID REFERENCES learner.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content.card_drafts (
  id TEXT PRIMARY KEY,
  course_slug TEXT NOT NULL REFERENCES content.course_drafts(slug) ON DELETE CASCADE,
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
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content.graph_drafts (
  course_slug TEXT NOT NULL REFERENCES content.course_drafts(slug) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  prerequisites TEXT[],
  domain TEXT,
  wiki_page TEXT,
  PRIMARY KEY (course_slug, concept)
);

-- Version history tables (immutable, append-only)

CREATE TABLE IF NOT EXISTS content.course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  version INT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  exam_target TEXT,
  target_audience TEXT,
  estimated_minutes INT,
  pass_threshold REAL,
  domains JSONB,
  wiki_refs TEXT[],
  card_order TEXT[],
  tags TEXT[],
  published_by UUID REFERENCES learner.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (slug, version)
);

CREATE TABLE IF NOT EXISTS content.card_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES content.course_versions(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
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
  source TEXT
);

-- Edit audit table

CREATE TABLE IF NOT EXISTS content.edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL,
  card_id TEXT,
  user_id UUID REFERENCES learner.users(id),
  action TEXT NOT NULL CHECK (action IN ('manual_edit', 'ai_accept', 'ai_reject', 'reorder', 'add_card', 'delete_card')),
  before_snapshot JSONB,
  after_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add published_version_id to existing courses table

ALTER TABLE content.courses ADD COLUMN IF NOT EXISTS published_version_id UUID;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_card_drafts_course ON content.card_drafts(course_slug);
CREATE INDEX IF NOT EXISTS idx_card_versions_version ON content.card_versions(version_id);
CREATE INDEX IF NOT EXISTS idx_edit_history_course ON content.edit_history(course_slug);
CREATE INDEX IF NOT EXISTS idx_course_drafts_created_by ON content.course_drafts(created_by);
