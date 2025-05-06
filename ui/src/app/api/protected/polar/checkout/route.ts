import { withProtectedRoute } from "@/lib/auth-middleware";
import { api } from "@/lib/polar";
import { prisma } from "@/lib/prisma";
import { Customer } from "@polar-sh/sdk/models/components/customer.js";
import { OrganizationMemberPermissions } from "@prisma/client";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const getCheckoutSession = async (req: NextRequest, session: Session) => {
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

  const productId = req.nextUrl.searchParams.get("productId") as string;

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID not found" },
      { status: 400 }
    );
  }

  const organization = await prisma.organization.findUnique({
    where: {
      id: BigInt(organizationId),
    },
    include: {
      OrganizationMember: {
        where: {
          userId: session.user.id,
          permissions: {
            has: OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING,
          },
        },
      },
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

  if (organization.OrganizationMember.length === 0) {
    return NextResponse.json(
      { error: "Organization member does not have permission" },
      { status: 403 }
    );
  }

  // if customer does not exist, create a customer
  let customer: Customer;
  try {
    customer = await api.customers.get({
      id: organization.polarCustomerId,
    });
  } catch (error: unknown) {
    try {
      // @ts-expect-error Polar SDK error
      if (error?.error === "ResourceNotFound") {
        customer = await api.customers.create({
          externalId: organization.id.toString(),
          email: organization.email,
          name: organization.name,
        });
        await prisma.organization.update({
          where: { id: organization.id },
          data: { polarCustomerId: customer.id },
        });
      } else {
        return NextResponse.json(
          { error: "Failed to find organization" },
          { status: 500 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      );
    }
  }

  const result = await api.checkouts.create({
    customerId: customer.id,
    customerExternalId: customer.externalId,
    products: [productId],
    successUrl: `${
      process.env.NEXT_PUBLIC_APP_URL
    }/platform/billing/checkout/success?externalId=${organization.id.toString()}&polarCustomerId=${
      organization.polarCustomerId
    }&successId={CHECKOUT_ID}`,
  });

  return NextResponse.json(result);
};

export const GET = (req: NextRequest) =>
  withProtectedRoute(getCheckoutSession, req);
