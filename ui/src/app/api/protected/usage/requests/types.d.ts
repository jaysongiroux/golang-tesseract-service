import { OrganizationFileCache, OrganizationOCRRequest } from "@prisma/client";

export type OrganizationOCRResponse = {
  requests: (OrganizationOCRRequest & {
    fileCache: OrganizationFileCache & {
      results: string | Record<string, unknown>;
    };
  })[];
  limit: number;
  offset: number;
};
