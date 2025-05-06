import { withProtectedRoute } from "@/lib/auth-middleware";
import { api } from "@/lib/polar";
import { prisma } from "@/lib/prisma";
import { OrganizationMemberPermissions } from "@prisma/client";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const getHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizationId = req.nextUrl.searchParams.get(
    "organizationId"
  ) as string;

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID not found" },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: BigInt(organizationId),
    },
    include: {
      OrganizationMember: {
        where: {
          userId: session.user.id,
          permissions: {
            has: OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING,
          },
        },
      },
    },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  if (!organization.polarCustomerId) {
    return NextResponse.json(
      { error: "Organization does not have a Polar customer ID" },
      { status: 400 }
    );
  }

  if (organization.OrganizationMember.length === 0) {
    return NextResponse.json(
      { error: "Organization member does not have permission" },
      { status: 403 }
    );
  }

  const result = await api.customerSessions.create({
    customerId: organization.polarCustomerId,
  });

  const meters = await api.customerMeters.list({
    customerId: organization.polarCustomerId,
    externalCustomerId: organization.id.toString(),
  });

  return NextResponse.json({
    customerPortalUrl: result.customerPortalUrl,
    meters,
  });
};

export const GET = (req: NextRequest) => withProtectedRoute(getHandler, req);
