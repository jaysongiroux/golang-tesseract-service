import { OrganizationFileCache, OrganizationOCRRequest } from "@prisma/client";

export type OrganizationOCRResponse = {
  requests: (OrganizationOCRRequest & {
    fileCache: OrganizationFileCache;
  })[];
  limit: number;
  offset: number;
};
