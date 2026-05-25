-- Manas Wellness Project — Neon Postgres schema
-- Run once against the Neon database to provision the table.
--   psql "$DATABASE_URL" -f db/schema.sql

CREATE TABLE IF NOT EXISTS support_messages (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255),
  message       TEXT         NOT NULL,
  is_donating   BOOLEAN      NOT NULL DEFAULT FALSE,
  is_approved   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_date  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT message_length CHECK (char_length(message) BETWEEN 10 AND 1000),
  CONSTRAINT name_length CHECK (char_length(name) BETWEEN 1 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_support_messages_approved_date
  ON support_messages (is_approved, created_date DESC);
