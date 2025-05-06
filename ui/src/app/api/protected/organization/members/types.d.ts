import { OrganizationMember } from "@prisma/client";

export type OrganizationMembersResponse =
  | {
      members: (OrganizationMember & {
        organizationId: string;
        user: {
          name: string;
          email: string;
          image: string | null;
          id: string;
          createdAt: Date;
        };
      })[];
      limit: number;
    }
  | {
      error: string;
    };

export type DeleteOrganizationMemberResponse =
  | {
      message: string;
    }
  | { error: string };

export type EditOrganizationMemberResponse =
  | {
      member: OrganizationMember & {
        organizationId: string;
        user: {
          name: string;
          email: string;
          image: string | null;
          id: string;
          createdAt: Date;
        };
      };
    }
  | { error: string };
