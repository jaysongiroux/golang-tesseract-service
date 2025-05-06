/*
  Warnings:

  - Added the required column `fileHash` to the `organization_ocr_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization_ocr_request" ADD COLUMN     "cacheHash" TEXT,
ADD COLUMN     "fileHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PolarActiveMeters" (
    "polarProductId" TEXT NOT NULL,
    "organizationId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolarActiveMeters_pkey" PRIMARY KEY ("polarProductId","organizationId")
);

-- CreateIndex
CREATE INDEX "PolarActiveMeters_polarProductId_organizationId_idx" ON "PolarActiveMeters"("polarProductId", "organizationId");

-- AddForeignKey
ALTER TABLE "PolarActiveMeters" ADD CONSTRAINT "PolarActiveMeters_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_ocr_request" ADD CONSTRAINT "organization_ocr_request_cacheHash_fkey" FOREIGN KEY ("cacheHash") REFERENCES "organization_file_cache"("hash") ON DELETE SET NULL ON UPDATE CASCADE;
