CREATE TABLE IF NOT EXISTS "users" (
  "user_id"       SERIAL NOT NULL PRIMARY KEY,
  "username"      VARCHAR(255) NOT NULL UNIQUE CHECK (regexp_matches("username", '^[a-zA-Z0-9]+$')),
  "email"         VARCHAR(255) NOT NULL UNIQUE CHECK ("email" LIKE '%@%'),
  "password"      VARCHAR(255) NOT NULL,
  "display_name"  VARCHAR(255),
  "status"        VARCHAR(512),
  "avatar"        VARCHAR(64)
);
