import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { OrganizationMemberPermissions } from "@prisma/client";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const deleteOrganizationHandler = async (
  request: NextRequest,
  session: Session
) => {
  if (!session?.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { organizationId } = await request.json();

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const authedOrgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        organizationId,
        userId: session.user?.id,
      },
    },
  });

  if (!authedOrgMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 403 }
    );
  }

  if (
    !authedOrgMember.permissions.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to delete this organization" },
      { status: 403 }
    );
  }

  await prisma.organization.delete({
    where: { id: organizationId },
  });

  return NextResponse.json(
    { message: "Organization deleted" },
    { status: 200 }
  );
};

export const DELETE = (req: NextRequest) =>
  withProtectedRoute(deleteOrganizationHandler, req);
