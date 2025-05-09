import { withProtectedRoute } from "@/lib/auth-middleware";
import { api } from "@/lib/polar";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { PolarMeterResponse } from "./types";

const getHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const organizationId = req.nextUrl.searchParams.get(
    "organizationId"
  ) as string;

  if (!organizationId) {
    return NextResponse.json(
      { error: "Organization ID not found" },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: BigInt(organizationId),
    },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  if (!organization.polarCustomerId) {
    return NextResponse.json(
      { error: "Organization does not have a Polar customer ID" },
      { status: 400 }
    );
  }

  const subs = await api.subscriptions.list({
    customerId: organization.polarCustomerId,
    productId: process.env.POLAR_OCR_PRODUCT_ID as string,
    active: true,
  });

  const meters = await api.customerMeters.list({
    externalCustomerId: organization.id.toString(),
    meterId: process.env.POLAR_OCR_METER_ID as string,
  });

  const OCRMeter = meters.result.items?.[0];
  const OCRSubscription = subs.result.items?.[0];

  return NextResponse.json({
    OCRMeter: OCRMeter
      ? {
          balance: OCRMeter?.balance,
          consumedUnits: OCRMeter?.consumedUnits,
          creditedUnits: OCRMeter?.creditedUnits,
        }
      : null,
    OCRSubscription: OCRSubscription
      ? { productId: OCRSubscription.productId }
      : null,
  } as PolarMeterResponse);
};

export const GET = (req: NextRequest) => withProtectedRoute(getHandler, req);
