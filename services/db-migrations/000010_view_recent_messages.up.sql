CREATE OR REPLACE VIEW "recent_messages" AS
SELECT *
FROM "messages"
WHERE "time" > yesterday;
