CREATE OR REPLACE VIEW "archived_messages" AS
SELECT *
FROM "messages"
WHERE "archived" = true;
