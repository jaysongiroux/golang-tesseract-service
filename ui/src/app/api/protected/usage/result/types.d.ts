import { OrganizationFileCache, OrganizationOCRRequest } from "@prisma/client";

export type ResultResponse = OrganizationOCRRequest & {
  fileCache: OrganizationFileCache & {
    results: Record<string, unknown>;
  };
};
