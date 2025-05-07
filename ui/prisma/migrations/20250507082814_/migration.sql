/*
  Warnings:

  - The primary key for the `organization_file_cache` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "organization_ocr_request" DROP CONSTRAINT "organization_ocr_request_cacheFileHash_organizationId_raw_fkey";

-- AlterTable
ALTER TABLE "organization_file_cache" DROP CONSTRAINT "organization_file_cache_pkey",
ADD CONSTRAINT "organization_file_cache_pkey" PRIMARY KEY ("organizationId", "hash", "raw", "ocrEngine");

-- AddForeignKey
ALTER TABLE "organization_ocr_request" ADD CONSTRAINT "organization_ocr_request_cacheFileHash_organizationId_raw__fkey" FOREIGN KEY ("cacheFileHash", "organizationId", "raw", "ocrEngine") REFERENCES "organization_file_cache"("hash", "organizationId", "raw", "ocrEngine") ON DELETE RESTRICT ON UPDATE CASCADE;
