UPDATE "matters" m
SET "tenantId" = c."tenantId"
FROM "clients" c
WHERE m."clientId" = c."id"
AND m."tenantId" != c."tenantId";
