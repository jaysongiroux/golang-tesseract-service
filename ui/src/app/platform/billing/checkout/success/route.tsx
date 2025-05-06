import { withProtectedRoute } from "@/lib/auth-middleware";
import { api } from "@/lib/polar";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const getHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const externalId = req.nextUrl.searchParams.get("externalId");
  const polarCustomerId = req.nextUrl.searchParams.get("polarCustomerId");
  const successId = req.nextUrl.searchParams.get("successId");

  if (!externalId || !polarCustomerId || !successId) {
    // redirect to error page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/platform/billing/checkout/error?errorMessage=Missing parameters`
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: BigInt(externalId),
    },
  });

  if (!organization) {
    // redirect to error page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/platform/billing/checkout/error?errorMessage=Organization not found`
    );
  }

  // check if the customer exists in Polar
  try {
    const customer = await api.customers.getExternal({
      externalId: externalId,
    });

    if (customer.id !== organization.polarCustomerId) {
      await prisma.organization.update({
        where: {
          id: organization.id,
        },
        data: {
          polarCustomerId: customer.id,
        },
      });
    }
  } catch (error) {
    console.error(
      "ui/src/app/platform/billing/checkout/success/route.tsx:50 error",
      error
    );
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/platform/billing/checkout/error?errorMessage=Customer not found`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/platform/billing`
  );
};

export const GET = (req: NextRequest) => withProtectedRoute(getHandler, req);
