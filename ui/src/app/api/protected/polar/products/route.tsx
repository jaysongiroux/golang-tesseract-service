import { withProtectedRoute } from "@/lib/auth-middleware";
import { api } from "@/lib/polar";
import { Product } from "@polar-sh/sdk/models/components/product.js";
import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const getProductsHandler = async (req: NextRequest, session: Session) => {
  if (!session.user?.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const productIds = req.nextUrl.searchParams.get("productIds")?.split(",");

  if (!productIds) {
    return NextResponse.json(
      { error: "Product IDs not found" },
      { status: 400 }
    );
  }

  const resp = await api.products.list({
    id: productIds,
  });

  const products: Product[] = [];
  for await (const page of resp) {
    // Handle the page
    products.push(...page.result.items.map((item) => item));
  }

  return NextResponse.json({
    products,
  });
};

export const GET = (req: NextRequest) =>
  withProtectedRoute(getProductsHandler, req);
