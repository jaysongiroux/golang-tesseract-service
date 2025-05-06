import { OrganizationOCRRequest } from "@prisma/client";

export type UsageResponse = {
  timeframe: "week" | "month" | "year";
  totalUsage: {
    date: string;
    count: number;
  }[];
  recentDocuments: (OrganizationOCRRequest & {
    createdAt: string;
    organizationId: string;
    id: string;
    numOfPages: number;
    tokenCount: number;
  })[];
};
