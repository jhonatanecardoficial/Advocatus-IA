const { PrismaClient } = require('@prisma/client');
try {
    const p = new PrismaClient({
        datasourceUrl: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
    });
    console.log('SUCCESS: PrismaClient initialized with datasourceUrl');
} catch (e) {
    console.error('FAILURE:', e.message);
}
