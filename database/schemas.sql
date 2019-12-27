CREATE TABLE IF NOT EXISTS "users" (
  "user_id"       SERIAL NOT NULL PRIMARY KEY,
  "username"      VARCHAR(255) NOT NULL UNIQUE
                    CHECK("username" ~ '^[a-zA-Z0-9]+$'),
  "email"         VARCHAR(255) NOT NULL UNIQUE
                    CHECK ("email" ~ '^.+@.+$'),
  "pw_hash"       VARCHAR(255) NOT NULL,
  "display_name"  VARCHAR(255),
  "status"        VARCHAR(512),
  "pic_url"       VARCHAR(64)
);
CREATE TABLE IF NOT EXISTS "pubkeys" (
  "user_id"    	INTEGER REFERENCES "users"("user_id"),
  "pubkey"     	VARCHAR(1024) NOT NULL PRIMARY KEY,
  "device_id"  	INTEGER NOT NULL,
  "last_used"  	TIMESTAMP WITH TIME ZONE NOT NULL,
  "desc_string"	VARCHAR(256)
);
CREATE TABLE IF NOT EXISTS "conversations" (
  "conv_id" 	SERIAL NOT NULL PRIMARY KEY,
  "convname"	VARCHAR(255) NOT NULL UNIQUE
                CHECK ("convname" ~ '^[a-zA-Z0-9]+$'),
  "archived"	BOOLEAN NOT NULL,
  "topic"   	VARCHAR(512),
  "pic_url" 	VARCHAR(64)
);
CREATE TABLE IF NOT EXISTS "conv_keys" (
  "key_id"    	SERIAL NOT NULL PRIMARY KEY,
  "user_id"   	INTEGER REFERENCES "users"("user_id"),
  "conv_id"   	INTEGER REFERENCES "conversations"("conv_id"),
  "shared_key"	VARCHAR(1024),
  "timefrom"  	TIMESTAMP NOT NULL,
  "timeto"    	TIMESTAMP,
  "favorite"  	BOOLEAN NOT NULL,
  "audio"     	BOOLEAN NOT NULL
);
CREATE TABLE IF NOT EXISTS "messages" (
  "msg_id"  	SERIAL NOT NULL PRIMARY KEY,
  "time"    	TIMESTAMP WITH TIME ZONE NOT NULL,
  "user_id" 	INTEGER REFERENCES "users"("user_id"),
  "conv_id" 	INTEGER REFERENCES "conversations"("conv_id"),
  "content" 	VARCHAR(4096) NOT NULL,
  "archived"	BOOLEAN NOT NULL
);
CREATE TABLE IF NOT EXISTS "seen" (
  "sid"    	SERIAL NOT NULL PRIMARY KEY,
  "msg_id" 	INTEGER REFERENCES "messages"("msg_id"),
  "user_id"	INTEGER REFERENCES "users"("user_id")
);
CREATE VIEW archived_messages AS SELECT * FROM messages WHERE archived == true;
CREATE VIEW active_messages AS SELECT * FROM messages WHERE archived == false;
CREATE VIEW active_keys AS SELECT * FROM keys WHERE timeto > now;
CREATE VIEW recent_messages AS SELECT * FROM messages WHERE time > yesterday;

