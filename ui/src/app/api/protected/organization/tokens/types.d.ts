import { OrganizationMemberAPIKeyScope } from "@prisma/client";

export type OrganizationMemberAPIKeysResponse = {
  tokens: {
    id: string;
    organizationId: string;
    name: string;
    createdAt: Date;
    scope: OrganizationMemberAPIKeyScope[];
    expiresAt: Date;
    lastChars: string;
  }[];
};

export type CreateOrganizationMemberAPIKeyResponse =
  | {
      createdToken: {
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        scope: OrganizationMemberAPIKeyScope[];
        expiresAt: Date;
        lastChars: string;
      };
      oneTimeToken: string;
    }
  | {
      error: string;
    };

export type DeleteOrganizationMemberAPIKeyResponse =
  | {
      success: boolean;
    }
  | {
      error: string;
    };
