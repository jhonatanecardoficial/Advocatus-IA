/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "isSharedWithClient" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "atcud" TEXT,
ADD COLUMN     "certDate" TIMESTAMP(3),
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "hashControl" TEXT,
ADD COLUMN     "isCertified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "number" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "series" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN     "signature" TEXT;

-- AlterTable
ALTER TABLE "legal_documents" ADD COLUMN     "embedding" vector(768);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "isFromClient" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "senderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "penaltyLimitAt" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "commercialRegistration" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "nif" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT;

-- CreateTable
CREATE TABLE "signed_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT,
    "documentId" TEXT,
    "originalFilePath" TEXT NOT NULL,
    "signedFilePath" TEXT,
    "signerName" TEXT,
    "signerNif" TEXT,
    "signatureTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signed_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_series" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FT',
    "nextNumber" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_accesses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_templates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "placeholders" TEXT[],
    "aiPrompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "signed_documents_tenantId_idx" ON "signed_documents"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_series_tenantId_code_key" ON "invoice_series"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "portal_accesses_token_key" ON "portal_accesses"("token");

-- CreateIndex
CREATE INDEX "portal_accesses_tenantId_idx" ON "portal_accesses"("tenantId");

-- CreateIndex
CREATE INDEX "portal_accesses_token_idx" ON "portal_accesses"("token");

-- CreateIndex
CREATE INDEX "legal_templates_tenantId_idx" ON "legal_templates"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_reference_key" ON "invoices"("reference");

-- AddForeignKey
ALTER TABLE "signed_documents" ADD CONSTRAINT "signed_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signed_documents" ADD CONSTRAINT "signed_documents_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "matters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signed_documents" ADD CONSTRAINT "signed_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_series" ADD CONSTRAINT "invoice_series_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_accesses" ADD CONSTRAINT "portal_accesses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_accesses" ADD CONSTRAINT "portal_accesses_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "matters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_accesses" ADD CONSTRAINT "portal_accesses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_templates" ADD CONSTRAINT "legal_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
