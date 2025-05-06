"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink } from "lucide-react";
import { useUser } from "@/providers";
import { usePolar } from "@/providers/polarProvider";
import Checkout from "@/components/polar/Checkout";
import { cn } from "@/lib/utils";
import { OrganizationMemberPermissions } from "@prisma/client";
import { toast } from "sonner";

export default function BillingPage() {
  const { selectedOrg } = useUser();
  const { ocrProduct, ocrSubscription, metersLoading, productsLoading } =
    usePolar();

  const plans = [
    {
      id: "ocr-free",
      selected: !metersLoading && !productsLoading && !ocrSubscription,
      name: "Free Plan",
      description: "100 pages included",
      price: 0,
      pages: 100,
      features: ["Basic OCR features", "JSON output", "Support"],
      hasPermission: selectedOrg?.groupMember?.permissions.includes(
        OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
      ),
    },
    {
      id: ocrProduct?.id as string,
      selected: ocrSubscription?.productId === ocrProduct?.id,
      name: "Pay As You Go",
      description: "No monthly fee",
      price: ocrProduct?.metadata?.pricePerUnit,
      pages: 100,
      features: ["Unlimited pages", "All OCR features", "Priority support"],
      hasPermission: selectedOrg?.groupMember?.permissions.includes(
        OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
      ),
    },
  ];

  const handleOpenCustomerPortal = () => {
    fetch(`/api/protected/polar/customer?organizationId=${selectedOrg?.id}`)
      .then((res) => res.json())
      .then((data) => {
        if ("error" in data) {
          toast.error(data.error);
        } else {
          window.open(data.customerPortalUrl, "_blank");
        }
      });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Billing & Subscription
        </h1>
        <p className="text-slate-400">
          Manage your subscription plan and billing information
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Choose Your Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.name}>
                  <Label
                    htmlFor="free"
                    className={cn(
                      "flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-6 hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 transition-all",
                      plan.selected && "border-blue-500 bg-blue-500/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{plan.name}</div>
                      {plan.selected && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 text-3xl font-bold">
                      ${plan.price}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        /month
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      {plan.description}
                    </div>
                    <div className="mt-4 space-y-2">
                      {plan.features.map((feature) => (
                        <div className="flex items-center" key={feature}>
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {plan?.id === ocrProduct?.id && plan.hasPermission && (
                      <Checkout
                        disabled={ocrSubscription?.productId === plan.id}
                        productId={ocrProduct?.id as string}
                      />
                    )}

                    {plan?.id === "ocr-free" && plan.hasPermission && (
                      <Button
                        className="mt-4 w-full cursor-pointer"
                        onClick={handleOpenCustomerPortal}
                        // disable if the user does not have a subscription
                        disabled={!ocrSubscription}
                      >
                        Select Plan
                      </Button>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrg?.groupMember?.permissions.includes(
          OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
        ) && (
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Payment Management</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row gap-4">
              <Button
                className="flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-800/80 border text-slate-50"
                onClick={handleOpenCustomerPortal}
              >
                View Customer Portal
                <ExternalLink size={16} />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
