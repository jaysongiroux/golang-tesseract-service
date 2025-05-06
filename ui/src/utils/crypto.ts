import "server-only";

import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import dayjs, { Dayjs } from "dayjs";
import { OrganizationMemberAPIKeyScope } from "@prisma/client";
import { hash } from "bcryptjs";

/**
 * Generates an encrypted API token and hashed token ID (jti)
 */
export async function generateEncryptedApiToken({
  userId,
  expirationDate,
  organizationId,
  scopes,
  oneTime,
}: {
  userId: string;
  expirationDate?: Dayjs;
  organizationId: string;
  scopes: OrganizationMemberAPIKeyScope[];
  oneTime?: boolean;
}) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    ...(expirationDate && {
      exp: dayjs(expirationDate).unix(),
    }),
    orgId: organizationId,
    seed: crypto.randomUUID(),
    scopes,
    oneTime: oneTime ? true : false,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const jwtToken = jwt.sign(payload, secret, {
    algorithm: "HS256",
  }) as string;

  const hash = await createHash("sha256").update(jwtToken).digest("hex");

  return {
    token: jwtToken,
    hash,
  };
}

export const hashPassword = async (password: string) => {
  return await hash(password, 12);
};
