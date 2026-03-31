const { PrismaClient } = require('@prisma/client');
try {
    const p = new PrismaClient({});
    console.log('SUCCESS: PrismaClient initialized with datasourceUrl');
} catch (e) {
    console.error('FAILURE:', e.message);
}
