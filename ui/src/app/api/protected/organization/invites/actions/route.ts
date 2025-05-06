import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { acceptInviteSchema, getInviteForUserSchema } from "@/utils/zodSchema";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { getInvitesResponse } from "./types";

const acceptInvitationHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { inviteId } = await req.json();

  const result = acceptInviteSchema.safeParse({
    inviteId,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const invitation = await prisma.organizationInvitation.findUnique({
    where: {
      id: inviteId,
    },
  });

  if (!invitation) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 400 }
    );
  }

  if (session?.user?.email !== invitation?.email) {
    return NextResponse.json(
      { error: "You are not authorized to accept this invitation" },
      { status: 400 }
    );
  }

  await prisma.organizationInvitation.delete({
    where: {
      id: inviteId,
    },
  });

  await prisma.organizationMember.create({
    data: {
      organizationId: invitation.organizationId,
      userId: session.user.id,
      permissions: invitation.permissions,
      accepted: true,
    },
  });

  return NextResponse.json({ message: "Invitation accepted" }, { status: 200 });
};

const denyInviteHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { inviteId } = await req.json();

  const authedUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!authedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  await prisma.organizationInvitation.delete({
    where: { id: inviteId, email: authedUser.email },
  });

  return NextResponse.json({ message: "Invitation denied" }, { status: 200 });
};

const getInviteHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const limitStr = req.nextUrl.searchParams.get("limit") as string;
  const offsetStr = req.nextUrl.searchParams.get("offset") as string;

  const result = getInviteForUserSchema.safeParse({
    limit: parseInt(limitStr),
    offset: parseInt(offsetStr),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { limit, offset } = result.data;

  const authedUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!authedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const invites = await prisma.organizationInvitation.findMany({
    where: {
      email: authedUser.email,
    },
    skip: offset,
    take: limit,
    include: {
      organization: {
        select: {
          name: true,
          id: true,
          _count: {
            select: {
              OrganizationMember: {
                where: {
                  accepted: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const invite of invites) {
    invite.organizationId =
      invite.organizationId.toString() as unknown as bigint;
    invite.organization.id =
      invite.organization.id.toString() as unknown as bigint;
  }

  return NextResponse.json(
    { invites, limit } as unknown as getInvitesResponse,
    {
      status: 200,
    }
  );
};

export const GET = (req: NextRequest) =>
  withProtectedRoute(getInviteHandler, req);

export const POST = (req: NextRequest) =>
  withProtectedRoute(acceptInvitationHandler, req);

export const DELETE = (req: NextRequest) =>
  withProtectedRoute(denyInviteHandler, req);
