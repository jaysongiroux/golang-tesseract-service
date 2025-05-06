import { prisma } from "@/lib/prisma";
import { withProtectedRoute } from "@/lib/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "next-auth";
import { OrganizationsResponse } from "./types";
import {
  OrganizationMember,
  OrganizationMemberPermissions,
} from "@prisma/client";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "@/utils/zodSchema";
import { api } from "@/lib/polar";

const handler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizations = await prisma.organization.findMany({
    where: {
      OrganizationMember: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  const numberOfMembersMap = new Map<
    string,
    {
      numberOfMembers: number;
      numberOfTotalTokens: number;
      numberOfActiveTokens: number;
      numberOfPagesProcessed: number;
      groupMember: OrganizationMember | null;
    }
  >();

  for (const org of organizations) {
    const groupMemberRequest = prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: org.id,
        },
      },
    });

    const numberOfPagesProcessedRequest =
      prisma.organizationOCRRequest.aggregate({
        _sum: {
          numOfPages: true,
        },
        where: {
          organizationId: org.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const numberOfMembersRequest = prisma.organizationMember.count({
      where: {
        organizationId: org.id,
      },
    });

    const numberOfActiveTokensRequest = prisma.organizationMemberAPIKey.count({
      where: {
        organizationId: org.id,
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },
    });

    const numberOfTotalTokensRequest = prisma.organizationMemberAPIKey.count({
      where: {
        organizationId: org.id,
      },
    });

    const [
      numberOfMembers,
      numberOfActiveTokens,
      numberOfTotalTokens,
      numberOfPagesProcessed,
      groupMember,
    ] = await prisma.$transaction([
      numberOfMembersRequest,
      numberOfActiveTokensRequest,
      numberOfTotalTokensRequest,
      numberOfPagesProcessedRequest,
      groupMemberRequest,
    ]);

    numberOfMembersMap.set(org.id.toString(), {
      numberOfMembers,
      numberOfActiveTokens,
      numberOfTotalTokens,
      groupMember,
      numberOfPagesProcessed: Number(numberOfPagesProcessed._sum.numOfPages),
    });
  }

  const response = organizations.map((org) => ({
    ...org,
    id: org.id.toString(),
    numberOfMembers: Number(
      numberOfMembersMap.get(org.id.toString())?.numberOfMembers
    ),
    numberOfActiveTokens: Number(
      numberOfMembersMap.get(org.id.toString())?.numberOfActiveTokens
    ),
    numberOfTotalTokens: Number(
      numberOfMembersMap.get(org.id.toString())?.numberOfTotalTokens
    ),
    numberOfPagesProcessed: Number(
      numberOfMembersMap.get(org.id.toString())?.numberOfPagesProcessed
    ),
    groupMember: {
      ...numberOfMembersMap.get(org.id.toString())?.groupMember,
      organizationId: org.id.toString(),
    },
  }));

  return NextResponse.json(response as unknown as OrganizationsResponse);
};

const createOrganizationHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { name, email } = await req.json();

  const result = createOrganizationSchema.safeParse({ name, email });
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const existingOrganization = await prisma.organization.findUnique({
    where: {
      email,
    },
  });

  if (existingOrganization) {
    return NextResponse.json(
      { error: "Organization with this email already exists" },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      email,
      OrganizationMember: {
        create: {
          userId: session.user.id,
          permissions: Object.values(OrganizationMemberPermissions),
          accepted: true,
        },
      },
    },
  });

  const polarCustomer = await api.customers.create({
    email,
    externalId: organization.id.toString(),
    name,
  });

  await prisma.organization.update({
    where: { id: organization.id },
    data: { polarCustomerId: polarCustomer.id },
  });

  return NextResponse.json({
    organization: {
      ...organization,
      id: organization.id.toString(),
    },
  });
};

const deleteOrganizationHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { id, confirm } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Organization ID not found" },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: id,
    },
    include: {
      OrganizationMember: {
        where: {
          userId: session.user.id,
          accepted: true,
          permissions: {
            has: OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS,
          },
        },
      },
    },
  });

  if (!organization) {
    return NextResponse.json({ error: "Access denied" }, { status: 404 });
  }

  if (!confirm && organization.polarCustomerId) {
    const subscriptions = await api.subscriptions.list({
      customerId: organization.polarCustomerId,
      active: true,
    });

    if (subscriptions.result.items.length > 0) {
      return NextResponse.json(
        { error: "Organization has active subscriptions" },
        { status: 400 }
      );
    }
  }

  const org = await prisma.organization.delete({
    where: {
      id: id,
    },
  });

  if (org.polarCustomerId) {
    await api.customers.delete({
      id: org.polarCustomerId,
    });
  }

  return NextResponse.json({
    organization: {
      ...org,
      id: org.id.toString(),
    },
  });
};

const updateOrganizationHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { id, name } = await req.json();

  const result = updateOrganizationSchema.safeParse({ name });
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: id,
    },
    include: {
      OrganizationMember: {
        where: {
          userId: session.user.id,
          permissions: {
            has: OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS,
          },
        },
      },
    },
  });

  if (!organization) {
    return NextResponse.json({ error: "Access denied" }, { status: 404 });
  }

  let updatedOrganization = await prisma.organization.update({
    where: {
      id: id,
    },
    data: { name },
  });

  if (updatedOrganization.polarCustomerId) {
    try {
      await api.customers.update({
        id: updatedOrganization.polarCustomerId,
        customerUpdate: {
          name,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error as unknown as { error: string }).error === "ResourceNotFound"
      ) {
        const polarCustomer = await api.customers.create({
          email: updatedOrganization.email,
          externalId: updatedOrganization.id.toString(),
          name,
        });

        updatedOrganization = await prisma.organization.update({
          where: { id: updatedOrganization.id },
          data: { polarCustomerId: polarCustomer.id },
        });
      }
    }
  } else {
    try {
      const polarCustomer = await api.customers.create({
        email: updatedOrganization.email,
        externalId: updatedOrganization.id.toString(),
        name,
      });

      updatedOrganization = await prisma.organization.update({
        where: { id: updatedOrganization.id },
        data: { polarCustomerId: polarCustomer.id },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create polar customer";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }

  return NextResponse.json({
    organization: {
      ...updatedOrganization,
      id: updatedOrganization.id.toString(),
    },
  });
};

export const GET = (req: NextRequest) => withProtectedRoute(handler, req);
export const POST = (req: NextRequest) =>
  withProtectedRoute(createOrganizationHandler, req);
export const DELETE = (req: NextRequest) =>
  withProtectedRoute(deleteOrganizationHandler, req);

export const PUT = (req: NextRequest) =>
  withProtectedRoute(updateOrganizationHandler, req);
