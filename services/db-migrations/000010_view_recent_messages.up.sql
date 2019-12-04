CREATE OR REPLACE VIEW "recent_messages" AS
SELECT *
FROM "messages"
WHERE "time" > NOW() - INTERVAL '24 HOURS';
