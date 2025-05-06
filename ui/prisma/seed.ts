import { api } from "../src/lib/polar";
import {
  OrganizationMemberAPIKeyScope,
  OrganizationMemberPermissions,
  PrismaClient,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = "password";
const email = "test@test.com";
const name = "Test User";

async function main() {
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organizationMemberAPIKey.deleteMany();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Test Organization",
      email,
    },
  });

  const polarCustomer = await api.customers.create({
    email,
    externalId: org.id.toString(),
    name: org.name,
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { polarCustomerId: polarCustomer.id },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      permissions: Object.values(OrganizationMemberPermissions),
      accepted: true,
    },
  });

  const token = await prisma.organizationMemberAPIKey.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      name: "Test Token",
      scope: [OrganizationMemberAPIKeyScope.SERVICE_OCR],
      keyHash: "test",
      lastChars: "test",
    },
  });

  console.log("Seeded database");
  console.log({
    user,
    org,
    token,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
