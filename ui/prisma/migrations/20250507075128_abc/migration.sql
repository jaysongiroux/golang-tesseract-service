/*
  Warnings:

  - The primary key for the `organization_file_cache` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cacheHash` on the `organization_ocr_request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization_ocr_request" DROP CONSTRAINT "organization_ocr_request_cacheHash_fkey";

-- AlterTable
ALTER TABLE "organization_file_cache" DROP CONSTRAINT "organization_file_cache_pkey",
ADD CONSTRAINT "organization_file_cache_pkey" PRIMARY KEY ("organizationId", "hash", "raw");

-- AlterTable
ALTER TABLE "organization_ocr_request" DROP COLUMN "cacheHash",
ADD COLUMN     "cacheFileHash" TEXT;

-- AddForeignKey
ALTER TABLE "organization_ocr_request" ADD CONSTRAINT "organization_ocr_request_cacheFileHash_organizationId_raw_fkey" FOREIGN KEY ("cacheFileHash", "organizationId", "raw") REFERENCES "organization_file_cache"("hash", "organizationId", "raw") ON DELETE RESTRICT ON UPDATE CASCADE;
