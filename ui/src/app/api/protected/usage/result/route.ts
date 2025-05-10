import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { OrganizationMemberPermissions } from "@prisma/client";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { R2, R2_BUCKET } from "@/utils/r2";
import { ResultResponse } from "./types";

const handler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizationId = req.nextUrl.searchParams.get("organizationId");
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID not found" },
      { status: 400 }
    );
  }

  if (!requestId) {
    return NextResponse.json(
      { error: "Request ID not found" },
      { status: 400 }
    );
  }

  const orgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
    },
  });

  if (!orgMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 400 }
    );
  }

  if (
    !orgMember.permissions.includes(
      OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_FILES
    ) &&
    !orgMember.permissions.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_FILES
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to view this organization's files" },
      { status: 400 }
    );
  }

  const request = (await prisma.organizationOCRRequest.findUnique({
    where: {
      organizationId: parseInt(organizationId),
      id: parseInt(requestId),
    },
    include: {
      fileCache: true,
    },
  })) as ResultResponse;

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 400 });
  }

  request.id = request.id.toString() as unknown as bigint;
  request.tokenCount = request.tokenCount.toString() as unknown as bigint;
  request.organizationId = parseInt(organizationId) as unknown as bigint;
  request.numOfPages = parseInt(
    request.numOfPages.toString()
  ) as unknown as bigint;

  if (request.fileCache) {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: request.fileCache.documentKey,
    });
    const response = await R2.send(command);
    const body = await response.Body?.transformToString();
    if (body) {
      request.fileCache.results = JSON.parse(body);
    }

    request.fileCache.organizationId = parseInt(
      organizationId
    ) as unknown as bigint;
  }

  return NextResponse.json({
    request,
  });
};

export const GET = (req: NextRequest) => withProtectedRoute(handler, req);
