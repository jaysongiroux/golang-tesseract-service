/*
  Warnings:

  - You are about to drop the `PolarActiveMeters` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[polarCustomerId]` on the table `organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OCREngine" ADD VALUE 'EASYOCR';
ALTER TYPE "OCREngine" ADD VALUE 'DOCTR';

-- DropForeignKey
ALTER TABLE "PolarActiveMeters" DROP CONSTRAINT "PolarActiveMeters_organizationId_fkey";

-- AlterTable
ALTER TABLE "organization_file_cache" ADD COLUMN     "raw" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organization_ocr_request" ADD COLUMN     "raw" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "PolarActiveMeters";

-- CreateIndex
CREATE UNIQUE INDEX "organization_polarCustomerId_key" ON "organization"("polarCustomerId");
