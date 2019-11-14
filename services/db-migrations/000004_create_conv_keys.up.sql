CREATE TABLE IF NOT EXISTS "conv_keys" (
  "key_id"    	SERIAL NOT NULL PRIMARY KEY,
  "user_id"   	INTEGER REFERENCES "users"("user_id"),
  "conv_id"   	INTEGER REFERENCES "conversations"("conv_id"),
  "shared_key"	VARCHAR(1024) NOT NULL UNIQUE,
  "timefrom"  	TIMESTAMP NOT NULL,
  "timeto"    	TIMESTAMP,
  "favorite"  	BOOLEAN NOT NULL,
  "audio"     	BOOLEAN NOT NULL,
);
