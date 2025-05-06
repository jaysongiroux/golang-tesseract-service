import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/utils/email";
import {
  acceptInviteSchema,
  editInviteSchema,
  getOrganizationInvitesSchema,
  inviteMemberSchema,
} from "@/utils/zodSchema";
import { OrganizationMemberPermissions } from "@prisma/client";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { InviteEmailTemplate } from "@/components/email/invite";

const inviteMemberHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { email, permissions, organizationId } = await req.json();

  const result = inviteMemberSchema.safeParse({
    email,
    permissions,
    organizationId,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
      OrganizationMember: {
        some: {
          accepted: true,
          organizationId: parseInt(organizationId),
        },
      },
    },
  });

  if (user) {
    return NextResponse.json(
      { error: "User already is a member of this organization" },
      { status: 400 }
    );
  }

  const authedOrgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
    },
    include: {
      organization: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!authedOrgMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 400 }
    );
  }

  if (
    !authedOrgMember?.permissions?.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to invite members" },
      { status: 400 }
    );
  }

  await prisma.organizationInvitation.deleteMany({
    where: {
      organizationId,
      email,
    },
  });

  const invitation = await prisma.organizationInvitation.create({
    data: {
      email,
      permissions,
      organizationId: parseInt(organizationId),
      authorId: session.user.id,
    },
  });

  try {
    await sendEmail({
      to: [email],
      subject: "You've been invited to join an organization",
      template: InviteEmailTemplate({
        toEmail: email,
        organizationName: authedOrgMember.organization.name,
        authorName: authedOrgMember.user.name ?? undefined,
      }),
    });
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json(
    {
      invitation: {
        ...invitation,
        organizationId: invitation.organizationId.toString(),
      },
    },
    { status: 200 }
  );
};

const deleteInvitationHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const inviteId = req.nextUrl.searchParams.get("inviteId") as string;

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

  // allow the user to delete their own invitation
  if (session?.user?.email !== invitation?.email) {
    const authedOrgMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: invitation?.organizationId,
        },
      },
    });

    if (!authedOrgMember) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 400 }
      );
    }

    if (
      !authedOrgMember?.permissions?.includes(
        OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
      )
    ) {
      return NextResponse.json(
        { error: "You are not authorized to delete invitations" },
        { status: 400 }
      );
    }

    await prisma.organizationInvitation.delete({
      where: {
        id: inviteId,
      },
    });

    return NextResponse.json(
      { message: "Invitation deleted" },
      { status: 200 }
    );
  } else if (session?.user?.email === invitation?.email) {
    await prisma.organizationInvitation.delete({
      where: {
        id: inviteId,
      },
    });

    return NextResponse.json(
      { message: "Invitation deleted" },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { error: "You are not authorized to delete this invitation" },
    { status: 400 }
  );
};

const getOrganizationInvitesHandler = async (
  req: NextRequest,
  session: Session
) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }
  const organizationIdParam = req.nextUrl.searchParams.get(
    "organizationId"
  ) as string;

  const limitParam = req.nextUrl.searchParams.get("limit") as string;
  const offsetParam = req.nextUrl.searchParams.get("offset") as string;

  const result = getOrganizationInvitesSchema.safeParse({
    organizationId: organizationIdParam,
    limit: parseInt(limitParam),
    offset: parseInt(offsetParam),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const { organizationId, limit, offset } = result.data;

  const organizationMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: parseInt(organizationId),
      },
    },
  });

  if (!organizationMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 400 }
    );
  }

  //   if the user does not have read or write access to the organization, they cannot view the invites
  if (
    !organizationMember?.permissions?.includes(
      OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_MEMBERS
    ) &&
    !organizationMember?.permissions?.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to view this organization's invites" },
      { status: 400 }
    );
  }

  const invites = await prisma.organizationInvitation.findMany({
    where: {
      organizationId: parseInt(organizationId),
    },
    skip: offset,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(
    {
      invites: invites.map((invite) => ({
        ...invite,
        organizationId: invite.organizationId.toString(),
      })),
      limit,
      offset,
    },
    { status: 200 }
  );
};

const editInvitationHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const { inviteId, permissions } = await req.json();

  const result = editInviteSchema.safeParse({
    inviteId,
    permissions,
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

  if (session?.user?.email === invitation?.email) {
    return NextResponse.json(
      { error: "You cannot edit your own invitation" },
      { status: 400 }
    );
  }

  const authedOrgMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: invitation?.organizationId,
      },
    },
  });

  if (!authedOrgMember) {
    return NextResponse.json(
      { error: "You are not a member of this organization" },
      { status: 400 }
    );
  }

  if (
    !authedOrgMember?.permissions?.includes(
      OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
    )
  ) {
    return NextResponse.json(
      { error: "You are not authorized to edit this invitation" },
      { status: 400 }
    );
  }

  const updatedInvitation = await prisma.organizationInvitation.update({
    where: {
      id: inviteId,
    },
    data: {
      permissions,
    },
  });

  return NextResponse.json(
    {
      invitation: {
        ...updatedInvitation,
        organizationId: updatedInvitation.organizationId.toString(),
      },
    },
    { status: 200 }
  );
};

export const POST = (req: NextRequest) =>
  withProtectedRoute(inviteMemberHandler, req);

export const DELETE = (req: NextRequest) =>
  withProtectedRoute(deleteInvitationHandler, req);

export const GET = (req: NextRequest) =>
  withProtectedRoute(getOrganizationInvitesHandler, req);

export const PATCH = (req: NextRequest) =>
  withProtectedRoute(editInvitationHandler, req);
