CREATE TABLE IF NOT EXISTS "messages" (
  "msg_id"  	SERIAL NOT NULL PRIMARY KEY,
  "time"    	TIMESTAMP WITH TIME ZONE NOT NULL,
  "user_id" 	INTEGER REFERENCES "users"("user_id"),
  "conv_id" 	INTEGER REFERENCES "conversations"("conv_id"),
  "content" 	VARCHAR(4096) NOT NULL,
  "archived"	BOOLEAN NOT NULL
);
