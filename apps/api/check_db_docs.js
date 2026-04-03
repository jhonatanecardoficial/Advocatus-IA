const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkDocs() {
  const prisma = new PrismaClient();
  try {
    console.log('Checking recent documents in DB...');
    const docs = await prisma.document.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        matter: { select: { title: true } }
      }
    });

    if (docs.length === 0) {
      console.log('No documents found in database.');
    } else {
      console.log('--- RECENT DOCUMENTS ---');
      docs.forEach(doc => {
        console.log(`Document: ${doc.filename}`);
        console.log(`- ID: ${doc.id}`);
        console.log(`- Matter: ${doc.matter?.title || 'Unknown'}`);
        console.log(`- Created At: ${doc.createdAt}`);
        console.log(`- Storage Path: ${doc.storagePath}`);
        console.log('------------------------');
      });
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocs();
