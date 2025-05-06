import { OrganizationInvitation } from "@prisma/client";

export type inviteMemberResponse =
  | {
      invitation: OrganizationInvitation & {
        organizationId: string;
      };
    }
  | { error: string };

export type deleteInvitationResponse =
  | {
      message: string;
    }
  | { error: string };

export type getOrganizationInvitesResponse =
  | {
      invites: (OrganizationInvitation & { organizationId: string })[];
      limit: number;
      offset: number;
    }
  | { error: string };

export type getOrganizationInvitesResponse =
  | {
      limit: number;
      offset: number;
      invites: (OrganizationInvitation & { organizationId: string })[];
    }
  | { error: string };

export type editInviteResponse =
  | {
      invitation: OrganizationInvitation & { organizationId: string };
    }
  | { error: string };
