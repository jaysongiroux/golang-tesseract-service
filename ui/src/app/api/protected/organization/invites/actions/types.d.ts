import { OrganizationInvitation } from "@prisma/client";

export type acceptDenyInviteResponse =
  | {
      message: string;
    }
  | { error: string };

export type getInvitesResponse = {
  invites: (OrganizationInvitation & {
    organizationId: string;
    organization: {
      id: string;
      name: string;
      _count: {
        OrganizationMember: number;
      };
    };
  })[];
  limit: number;
};
