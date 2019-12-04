CREATE OR REPLACE VIEW "participates" AS
SELECT DISTINCT "user_id", "conv_id"
FROM "conv_keys"
WHERE "timeto" > NOW();
