
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Verificando Documentos na Base de Dados ---')
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      versions: true
    }
  })

  if (docs.length === 0) {
    console.log('Nenhum documento encontrado.')
  } else {
    docs.forEach(doc => {
      console.log(`[DOC] ID: ${doc.id} | Nome: ${doc.filename} | Matter: ${doc.matterId} | Criado: ${doc.createdAt}`)
      doc.versions.forEach(v => {
        console.log(`  └ [VER] ID: ${v.id} | Path: ${v.storagePath} | Tamanho: ${v.sizeBytes}`)
      })
    })
  }
}

main()
  .catch(e => {
    console.error('Erro ao verificar documentos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
