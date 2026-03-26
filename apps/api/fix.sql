
UPDATE "Matter"
SET "tenantId" = c."tenantId"
FROM "Client" c
WHERE "Matter"."clientId" = c.id
AND ("Matter"."tenantId" IS NULL OR "Matter"."tenantId" <> c."tenantId")
AND "Matter"."deletedAt" IS NULL;
