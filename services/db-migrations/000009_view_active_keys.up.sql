CREATE OR REPLACE VIEW "active_keys" AS
SELECT *
FROM "conv_keys"
WHERE "timeto" > NOW();
