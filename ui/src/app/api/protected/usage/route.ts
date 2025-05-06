import { withProtectedRoute } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { UsageResponse } from "./types";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const handler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizationId = req.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID not found" },
      { status: 400 }
    );
  }

  const timeframe: "week" | "month" | "year" = (req.nextUrl.searchParams.get(
    "timeframe"
  ) || "week") as "week" | "month" | "year";

  let startDate: Date;
  let timeUnit: string;
  let interval: string;
  let numPoints: number;

  // Use UTC dates to avoid timezone issues
  const now = dayjs().utc();

  switch (timeframe) {
    case "week":
      // For week view, include exactly 7 days
      numPoints = 7;
      // We get 7 points from 0 to 6 (inclusive) using "1 day" interval
      startDate = now.subtract(6, "day").startOf("day").toDate();
      timeUnit = "day";
      interval = "1 day";
      break;
    case "month":
      // For month view, get 4 weeks
      numPoints = 4;
      startDate = now.subtract(4, "week").startOf("day").toDate();
      timeUnit = "week";
      interval = "1 week";
      break;
    case "year":
      // For year view, get 12 months
      numPoints = 12;
      startDate = now.subtract(12, "month").startOf("month").toDate();
      timeUnit = "month";
      interval = "1 month";
      break;
    default:
      numPoints = 7;
      startDate = now.subtract(6, "day").startOf("day").toDate();
      timeUnit = "day";
      interval = "1 day";
  }

  // End date should be now
  const endDate = now.toDate();

  // Generate a complete timeline with zeros for missing dates using SQL
  const organizationUsage: { date: string; count: number }[] =
    await prisma.$queryRaw`
    WITH date_series AS (
      SELECT 
        date::date
      FROM 
        generate_series(
          ${startDate}::timestamp, 
          ${endDate}::timestamp, 
          ${interval}::interval
        ) date
    ),
    usage_data AS (
      SELECT 
        DATE_TRUNC(${timeUnit}, "createdAt"::timestamp) AS date,
        COUNT(*)::int AS count
      FROM organization_ocr_request
      WHERE "createdAt" >= ${startDate}
      AND "organizationId"::text = ${organizationId}
      GROUP BY date
    )
    SELECT 
      to_char(date_series.date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
      COALESCE(usage_data.count, 0) AS count
    FROM 
      date_series
    LEFT JOIN 
      usage_data ON date_series.date = usage_data.date
    ORDER BY 
      date_series.date ASC
    LIMIT ${numPoints}
  `;

  const recentRequests = await prisma.organizationOCRRequest.findMany({
    where: {
      organizationId: BigInt(organizationId),
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return NextResponse.json({
    totalUsage: organizationUsage.map((item) => ({
      date: item.date, // Already in ISO format
      count: item.count,
    })),
    timeframe,
    recentDocuments: recentRequests.map((item) => ({
      ...item,
      id: item.id.toString(),
      organizationId: item.organizationId.toString(),
      numOfPages: Number(item.numOfPages),
      tokenCount: Number(item.tokenCount),
      createdAt: item.createdAt.toISOString(),
    })),
  } as UsageResponse);
};

export const GET = (req: NextRequest) => withProtectedRoute(handler, req);
