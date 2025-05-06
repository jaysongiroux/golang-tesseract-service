import {
  Organization,
  OrganizationMember,
  PolarActiveMeters,
} from "@prisma/client";

export type OrganizationsResponse = (Organization & {
  PolarActiveMeters: (PolarActiveMeters & { organizationId: string }) | null;
  numberOfMembers: number;
  numberOfActiveTokens: number;
  numberOfTotalTokens: number;
  numberOfPagesProcessed: number;
  id: string;
  groupMember: (OrganizationMember & { organizationId: string }) | null;
})[];

export type createOrganizationResponse =
  | {
      organization: Organization & {
        OrganizationMember: OrganizationMember[];
      };
    }
  | {
      error: string;
    };

export type deleteOrganizationResponse =
  | {
      organization: Organization;
    }
  | {
      error: string;
    };

export type updateOrganizationResponse =
  | {
      organization: Organization;
    }
  | {
      error: string;
    };
