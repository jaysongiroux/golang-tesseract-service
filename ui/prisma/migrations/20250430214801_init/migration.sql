-- CreateEnum
CREATE TYPE "OCREngine" AS ENUM ('TESSERACT');

-- CreateEnum
CREATE TYPE "OrganizationMemberPermissions" AS ENUM ('READ_ONLY_ORGANIZATION_MEMBERS', 'MANAGE_ORGANIZATION_MEMBERS', 'READ_ONLY_ORGANIZATION_SETTINGS', 'MANAGE_ORGANIZATION_SETTINGS', 'READ_ONLY_ORGANIZATION_BILLING', 'WRITE_ORGANIZATION_BILLING', 'CREATE_PERSONAL_API_KEYS', 'READ_ONLY_ORGANIZATION_FILES', 'MANAGE_ORGANIZATION_FILES');

-- CreateEnum
CREATE TYPE "OrganizationMemberAPIKeyScope" AS ENUM ('SERVICE_OCR');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "polarCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "permissions" "OrganizationMemberPermissions"[],
    "organizationId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_member" (
    "userId" TEXT NOT NULL,
    "organizationId" BIGINT NOT NULL,
    "permissions" "OrganizationMemberPermissions"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "organization_member_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "organization_member_api_key" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" BIGINT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "lastChars" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scope" "OrganizationMemberAPIKeyScope"[],

    CONSTRAINT "organization_member_api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_file_cache" (
    "organizationId" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "results" TEXT NOT NULL,
    "ocrEngine" "OCREngine" NOT NULL,

    CONSTRAINT "organization_file_cache_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "organization_ocr_request" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cacheHit" BOOLEAN NOT NULL,
    "numOfPages" BIGINT NOT NULL,
    "ocrEngine" "OCREngine" NOT NULL,
    "organizationId" BIGINT NOT NULL,
    "filename" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "tokenCount" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "organization_ocr_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_providerId_providerAccountId_idx" ON "Account"("userId", "providerId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_providerAccountId_key" ON "Account"("providerId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");

-- CreateIndex
CREATE INDEX "Session_userId_expires_idx" ON "Session"("userId", "expires");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_email_idx" ON "User"("id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_token_key" ON "VerificationRequest"("token");

-- CreateIndex
CREATE INDEX "VerificationRequest_identifier_token_idx" ON "VerificationRequest"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_identifier_token_key" ON "VerificationRequest"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_email_key" ON "organization"("email");

-- CreateIndex
CREATE INDEX "organization_id_name_email_idx" ON "organization"("id", "name", "email");

-- CreateIndex
CREATE INDEX "OrganizationInvitation_id_idx" ON "OrganizationInvitation"("id");

-- CreateIndex
CREATE INDEX "organization_member_userId_organizationId_idx" ON "organization_member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_api_key_keyHash_key" ON "organization_member_api_key"("keyHash");

-- CreateIndex
CREATE INDEX "organization_member_api_key_keyHash_userId_organizationId_idx" ON "organization_member_api_key"("keyHash", "userId", "organizationId");

-- CreateIndex
CREATE INDEX "organization_file_cache_hash_idx" ON "organization_file_cache"("hash");

-- CreateIndex
CREATE INDEX "organization_ocr_request_id_idx" ON "organization_ocr_request"("id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member_api_key" ADD CONSTRAINT "organization_member_api_key_userId_organizationId_fkey" FOREIGN KEY ("userId", "organizationId") REFERENCES "organization_member"("userId", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member_api_key" ADD CONSTRAINT "organization_member_api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_file_cache" ADD CONSTRAINT "organization_file_cache_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_ocr_request" ADD CONSTRAINT "organization_ocr_request_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
