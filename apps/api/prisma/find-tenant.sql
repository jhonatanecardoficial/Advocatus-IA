SELECT 
    t.id, 
    t.name, 
    (SELECT COUNT(*) FROM matters m WHERE m."tenantId" = t.id) as matters, 
    (SELECT COUNT(*) FROM clients c WHERE c."tenantId" = t.id) as clients 
FROM tenants t 
ORDER BY matters DESC 
LIMIT 5;
