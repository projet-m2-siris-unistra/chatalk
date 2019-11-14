CREATE TABLE IF NOT EXISTS "conversations" (
  "conv_id" 	SERIAL NOT NULL PRIMARY KEY,
  "convname"	VARCHAR(255) NOT NULL UNIQUE CHECK ("convname" ~ '^[a-zA-Z0-9]+$'),
  "archived"	BOOLEAN NOT NULL,
  "topic"   	VARCHAR(512),
  "pic_url" 	VARCHAR(64),
);
