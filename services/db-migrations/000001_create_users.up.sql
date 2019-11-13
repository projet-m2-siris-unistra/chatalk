CREATE TABLE IF NOT EXISTS "users" (
  "user_id"       SERIAL NOT NULL PRIMARY KEY,
  "username"      VARCHAR(255) NOT NULL UNIQUE,
  "email"         VARCHAR(255) NOT NULL UNIQUE,
  "password"      VARCHAR(255) NOT NULL,
  "display_name"  VARCHAR(255),
  "avatar"        VARCHAR(64)
);
