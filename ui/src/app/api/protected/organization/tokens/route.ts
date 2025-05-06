import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {
  CreateOrganizationMemberAPIKeyResponse,
  OrganizationMemberAPIKeysResponse,
} from "./types";
import { z } from "zod";
import { OrganizationMemberPermissions } from "@prisma/client";
import dayjs from "dayjs";
import { generateEncryptedApiToken } from "@/utils/crypto";
import { newAPITokenSchema, organizationIdSchema } from "@/utils/zodSchema";

const handler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizationId = req.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  const tokens = await prisma.organizationMemberAPIKey.findMany({
    where: {
      organizationId: parseInt(organizationId),
      organizationMember: {
        userId: session.user.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      createdAt: true,
      scope: true,
      expiresAt: true,
      lastChars: true,
    },
  });

  return NextResponse.json({
    tokens: tokens.map((token) => ({
      ...token,
      organizationId: token.organizationId.toString(),
    })) as OrganizationMemberAPIKeysResponse["tokens"],
  });
};

const createTokenHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }
  const body = await req.json();

  const tokenSchema = z.object({
    ...newAPITokenSchema.shape,
    organizationId: organizationIdSchema,
  });

  const { success, data, error } = tokenSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { error: error.flatten().formErrors[0] },
      { status: 400 }
    );
  }

  const { scopes, name, organizationId, expirationDate } = data;

  const groupMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
      accepted: true,
    },
  });

  if (
    !groupMember?.permissions?.includes(
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

  if (!groupMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 403 }
    );
  }

  try {
    const { token, hash } = await generateEncryptedApiToken({
      userId: session.user.id,
      organizationId,
      expirationDate: expirationDate ? dayjs(expirationDate) : undefined,
      scopes,
    });

    const createdToken = await prisma.organizationMemberAPIKey.create({
      data: {
        name,
        organizationId: parseInt(organizationId),
        keyHash: hash,
        expiresAt: expirationDate || null,
        scope: scopes,
        lastChars: token.slice(-4),
        userId: session.user.id,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        createdAt: true,
        scope: true,
        expiresAt: true,
        lastChars: true,
        userId: true,
      },
    });

    return NextResponse.json(
      {
        createdToken: {
          ...createdToken,
          organizationId: createdToken.organizationId.toString(),
        },
        oneTimeToken: token,
      } as CreateOrganizationMemberAPIKeyResponse,
      { status: 200 }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};

const deleteTokenHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  // Parse the URL to extract tokenId and organizationId
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("tokenId");
  const organizationId = url.searchParams.get("organizationId");

  if (!tokenId) {
    return NextResponse.json(
      { error: "Token ID is required" },
      { status: 400 }
    );
  }

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  // Check if the user is a member of the organization with proper permissions
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

  // Check if the token belongs to the user
  const token = await prisma.organizationMemberAPIKey.findUnique({
    where: {
      id: tokenId,
      userId: session.user.id,
      organizationId: parseInt(organizationId),
    },
  });

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  // Verify the token belongs to the user and organization
  if (
    token.userId !== session.user.id ||
    token.organizationId.toString() !== organizationId
  ) {
    return NextResponse.json(
      { error: "You can only delete your own tokens" },
      { status: 403 }
    );
  }

  // Delete the token
  await prisma.organizationMemberAPIKey.delete({
    where: {
      id: tokenId,
    },
  });

  return NextResponse.json({ success: true });
};

export const GET = (req: NextRequest) => withProtectedRoute(handler, req);
export const POST = (req: NextRequest) =>
  withProtectedRoute(createTokenHandler, req);

export const DELETE = (req: NextRequest) =>
  withProtectedRoute(deleteTokenHandler, req);
