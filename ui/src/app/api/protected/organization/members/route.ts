import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { OrganizationMembersResponse } from "./types";
import { z } from "zod";
import { OrganizationMemberPermissions } from "@prisma/client";
import { editMemberPermissionsSchema } from "@/utils/zodSchema";

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

  const offset = req.nextUrl.searchParams.get("offset");
  const limit = req.nextUrl.searchParams.get("limit");

  if (!limit || parseInt(limit) > 30) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: parseInt(organizationId),
      OrganizationMember: {
        some: {
          userId: session.user.id,
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

  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId: parseInt(organizationId),
    },
    take: parseInt(limit),
    skip: offset ? parseInt(offset) : 0,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          id: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({
    members: members.map((member) => ({
      ...member,
      organizationId: member.organizationId.toString(),
    })),
    limit: parseInt(limit),
  } as OrganizationMembersResponse);
};

const deleteMemberHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const memberIdParam = req.nextUrl.searchParams.get("memberId");
  const organizationIdParam = req.nextUrl.searchParams.get("organizationId");

  if (!memberIdParam) {
    return NextResponse.json(
      { error: "Member ID is required" },
      { status: 400 }
    );
  }

  if (!organizationIdParam) {
    return NextResponse.json(
      { error: "Organization ID is required" },
      { status: 400 }
    );
  }

  const result = z
    .object({
      memberId: z.string({
        message: "Member ID is required",
      }),
      organizationId: z.string({
        message: "Organization ID is required",
      }),
    })
    .safeParse({
      memberId: memberIdParam,
      organizationId: organizationIdParam,
    });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const { memberId, organizationId } = result.data;

  const authedOrgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
    },
  });

  const member = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId: parseInt(organizationId),
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (!authedOrgMember) {
    return NextResponse.json(
      { error: "You are not authorized to delete this member" },
      { status: 400 }
    );
  }

  // allow users to leave organizations
  if (authedOrgMember.userId !== member.userId) {
    if (
      !authedOrgMember.permissions.includes(
        OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
      )
    ) {
      return NextResponse.json(
        { error: "You are not authorized to delete this member" },
        { status: 400 }
      );
    }
  } else if (authedOrgMember.userId === member.userId) {
    // determine how many members are left in the organization.
    // if there is no more members, return an error
    const numberOfMembers = await prisma.organizationMember.count({
      where: {
        organizationId: parseInt(organizationId),
        accepted: true,
        userId: {
          not: member.userId,
        },
      },
    });

    if (numberOfMembers === 0) {
      return NextResponse.json(
        {
          error:
            "You cannot leave the organization since you are the only member. You can delete the organization instead.",
        },
        { status: 400 }
      );
    }
  }

  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId: parseInt(organizationId),
      },
    },
  });

  return NextResponse.json({ message: "Member deleted" }, { status: 200 });
};

const editMemberPermissionsHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const {
    memberId: memberIdParam,
    organizationId: organizationIdParam,
    permissions: permissionsParam,
  } = await req.json();

  if (!memberIdParam || !organizationIdParam || !permissionsParam) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const result = editMemberPermissionsSchema.safeParse({
    memberId: memberIdParam,
    organizationId: organizationIdParam,
    permissions: permissionsParam,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { memberId, organizationId, permissions } = result.data;

  const authedOrgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
    },
  });

  if (!authedOrgMember) {
    return NextResponse.json(
      { error: "You are not authorized to edit this member" },
      { status: 400 }
    );
  }

  if (
    !authedOrgMember.permissions.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to edit this member" },
      { status: 400 }
    );
  }

  const updatedMember = await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId: parseInt(organizationId),
      },
    },
    data: {
      permissions,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
          id: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      member: {
        ...updatedMember,
        organizationId: updatedMember.organizationId.toString(),
      },
    },
    { status: 200 }
  );
};

export const GET = (req: NextRequest) => withProtectedRoute(handler, req);
export const DELETE = (req: NextRequest) =>
  withProtectedRoute(deleteMemberHandler, req);
export const PATCH = (req: NextRequest) =>
  withProtectedRoute(editMemberPermissionsHandler, req);
