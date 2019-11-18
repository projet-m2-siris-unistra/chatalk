CREATE TABLE IF NOT EXISTS "pubkeys" (
  "user_id"    	INTEGER REFERENCES "users"("user_id"),
  "pubkey"     	VARCHAR(1024) NOT NULL PRIMARY KEY,
  "device_id"  	INTEGER NOT NULL,
  "last_used"  	TIMESTAMP WITH TIME ZONE NOT NULL,
  "desc_string"	VARCHAR(256)
);
