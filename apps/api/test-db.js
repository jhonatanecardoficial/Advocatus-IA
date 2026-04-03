require('dotenv').config({ path: '../../.env' });
const fs = require('fs');

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.client.findFirst().then(() => {
    fs.writeFileSync('log.txt', 'DB Success');
    prisma.$disconnect();
  }).catch(e => {
    fs.writeFileSync('log.txt', 'DB Query Error: ' + e.stack);
    prisma.$disconnect();
  });
} catch(e) {
  fs.writeFileSync('log.txt', 'Initialization Error: ' + e.stack);
}
