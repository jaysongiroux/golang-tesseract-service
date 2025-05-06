import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateEncryptedApiToken } from "@/utils/crypto";
import { organizationIdSchema, scopeSchema } from "@/utils/zodSchema";
import { OrganizationMemberPermissions } from "@prisma/client";
import dayjs from "dayjs";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOneTimeTokenHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const body = await req.json();

  const tokenSchema = z.object({
    organizationId: organizationIdSchema,
    scopes: scopeSchema,
  });

  const { success, error } = tokenSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { error: error.flatten().formErrors[0] },
      { status: 400 }
    );
  }

  const { organizationId, scopes } = body;

  const expiration = dayjs().add(10, "minutes").toISOString();

  const groupMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
      accepted: true,
    },
  });

  if (!groupMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 403 }
    );
  }

  if (
    !groupMember.permissions.includes(
      OrganizationMemberPermissions.CREATE_PERSONAL_API_KEYS
    )
  ) {
    return NextResponse.json(
      {
        error:
          "You are not authorized to create personal API keys. Contact your organization administrator.",
      },
      { status: 403 }
    );
  }

  const { token } = await generateEncryptedApiToken({
    userId: session.user.id,
    organizationId,
    expirationDate: dayjs(expiration),
    scopes,
    oneTime: true,
  });

  return NextResponse.json({ token }, { status: 200 });
};

export const POST = (req: NextRequest) =>
  withProtectedRoute(createOneTimeTokenHandler, req);
