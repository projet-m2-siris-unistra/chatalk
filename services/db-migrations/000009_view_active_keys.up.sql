CREATE OR REPLACE VIEW "active_keys" AS
SELECT *
FROM "keys"
WHERE "timeto" > now;
