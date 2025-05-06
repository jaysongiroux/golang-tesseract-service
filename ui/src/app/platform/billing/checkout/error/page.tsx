"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function CheckoutErrorPage() {
  return (
    <Suspense>
      <CheckoutError />
    </Suspense>
  );
}

function CheckoutError() {
  const params = useSearchParams();
  const errorMessage = params.get("errorMessage");

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Checkout Error</CardTitle>
          <CardDescription>
            There was an issue processing your payment. Please contact{" "}
            <a
              className="text-blue-500"
              href={`mailto:support@${process.env.NEXT_PUBLIC_DOMAIN_NAME}`}
            >
              support
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label>Error Message</Label>
          <div className="bg-slate-800 p-2 rounded-md">
            <p className="text-sm text-muted-foreground font-mono ">
              {errorMessage}
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
