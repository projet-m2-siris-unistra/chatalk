CREATE TABLE IF NOT EXISTS "seen" (
  "sid"    	SERIAL NOT NULL PRIMARY KEY,
  "msg_id" 	INTEGER REFERENCES "messages"("msg_id"),
  "user_id"	INTEGER REFERENCES "users"("user_id"),
);
