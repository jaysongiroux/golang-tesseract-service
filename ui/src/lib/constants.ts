import { OrganizationMemberPermissions } from "@prisma/client";

export const PERMISSIONS_MAP: Record<OrganizationMemberPermissions, string> = {
  [OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_MEMBERS]:
    "Read organization members",
  [OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS]:
    "Manage organization members",
  [OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_SETTINGS]:
    "Read organization settings",
  [OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS]:
    "Manage organization settings",
  [OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_FILES]:
    "Read organization files",
  [OrganizationMemberPermissions.MANAGE_ORGANIZATION_FILES]:
    "Manage organization files",
  [OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_BILLING]:
    "Read organization billing",
  [OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING]:
    "Manage organization billing",
  [OrganizationMemberPermissions.CREATE_PERSONAL_API_KEYS]:
    "Create personal API keys",
};

export const PRICE_PER_PAGE = 0.01;
export const FREE_PAGES = 100;

export const DOCUMENTATION_URL =
  process.env.NEXT_PUBLIC_SERVICE_BACKEND_URL + "/swagger/index.html";
