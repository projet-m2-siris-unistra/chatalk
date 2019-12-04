CREATE OR REPLACE VIEW "active_messages" AS
SELECT *
FROM "messages"
WHERE "archived" = false;
