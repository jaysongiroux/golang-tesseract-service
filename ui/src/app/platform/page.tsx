"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  ChevronRight,
  FileText,
  Key,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import dayjs from "dayjs";
import { useUser } from "@/providers";
import { Progress } from "@/components/ui/progress";
import { ProcessDocumentDrawer } from "@/components/ProcessDocumentDrawer";
import { cn } from "@/lib/utils";
import { OrganizationMemberPermissions } from "@prisma/client";
import { usePolar } from "@/providers/polarProvider";

export default function PlatformPage() {
  const { selectedOrg, organizations, usageData, isLoading } = useUser();
  const {
    ocrMeter,
    ocrSubscription,
    productsLoading,
    metersLoading,
    ocrProduct,
  } = usePolar();

  const combinedLoading = metersLoading || isLoading || productsLoading;

  const maxValue = Math.max(
    ...(usageData?.totalUsage || []).map((item) => item.count)
  );

  const isTotalUsageEmpty = (usageData?.totalUsage || []).every(
    (item) => item.count === 0
  );

  if (combinedLoading)
    return (
      <DashboardLayout>
        <></>
      </DashboardLayout>
    );

  if (!combinedLoading && !selectedOrg) {
    return (
      <DashboardLayout>
        {/* Create an organization first */}
        <div className="flex items-center justify-center h-[80vh]">
          <Card>
            <CardHeader>
              <CardTitle>
                Welcome to {process.env.NEXT_PUBLIC_PRODUCT_NAME}!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                In order to utilize our services you need to create an
                organization first
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/platform/organizations">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-slate-50">
                  <Plus className="h-4 w-4" />
                  Create Organization
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="text-slate-400">
              Welcome back! Here&apos;s an overview of your account.
            </p>
          </div>
          {selectedOrg?.groupMember?.permissions?.includes(
            OrganizationMemberPermissions.CREATE_PERSONAL_API_KEYS
          ) && <ProcessDocumentDrawer />}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Pages Processed</CardDescription>

                <CardTitle className="text-2xl flex flex-row items-center gap-2">
                  {ocrMeter?.consumedUnits || 0}
                  {!!!ocrSubscription && "/ 100"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 h-12 w-full">
                <Progress
                  value={ocrMeter?.consumedUnits || 0}
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
                  className="bg-slate-800"
                />
                <p className="text-xs text-slate-400">
                  {100 - (ocrMeter?.consumedUnits || 0)} free pages remaining
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Organizations</CardDescription>
                <CardTitle className="text-2xl">
                  {organizations?.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between h-12">
                <Link
                  href="/platform/organizations"
                  className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>API Tokens</CardDescription>
                <CardTitle className="text-2xl">
                  {selectedOrg?.numberOfTotalTokens}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-start md:items-center justify-between h-12 md:flex-row flex-col flex-wrap">
                <p className="text-xs text-slate-400">
                  {selectedOrg?.numberOfActiveTokens} active tokens
                </p>
                <Link
                  href="/platform/tokens"
                  className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription>Team Members</CardDescription>
                <CardTitle className="text-2xl">
                  {selectedOrg?.numberOfMembers}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between h-12">
                <Link
                  href="/platform/team"
                  className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                >
                  View All
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-8 space-y-4">
          {/* header */}
          <div className="flex items-center justify-between text-2xl font-bold">
            Overview
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 h-75 backdrop-blur-sm ">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Documents</CardTitle>
                    <Link
                      href="/platform/documents"
                      className="flex items-center text-xs text-blue-400 hover:text-blue-300"
                    >
                      View All
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="overflow-scroll h-full flex flex-col gap-4">
                  {usageData?.recentDocuments.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No recent documents
                    </p>
                  )}

                  {(usageData?.recentDocuments || []).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 rounded-md bg-slate-800 p-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          {doc.filename}

                          <div className="flex items-center gap-2">
                            <p className="text-xs text-slate-400">
                              {dayjs(doc.createdAt).format(
                                "MMMM D, YYYY h:mm A"
                              )}
                            </p>
                            {doc.cacheHit && (
                              <p className="text-xs text-green-400">Cached</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className="mr-2 border-slate-700 bg-slate-800 text-slate-300"
                        >
                          {doc.numOfPages} pages
                        </Badge>

                        <Badge
                          className={cn(
                            "bg-green-500/20 text-green-400",
                            doc.success
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          )}
                        >
                          {doc.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* quick actions  */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Link
                      href="/platform/organizations"
                      className="h-auto w-auto"
                    >
                      <Button
                        variant="outline"
                        className="flex h-auto w-full flex-col items-center justify-center border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white"
                      >
                        <Building className="mb-2 h-6 w-6" />
                        <span className="text-sm text-slate-50">
                          New Organization
                        </span>
                      </Button>
                    </Link>

                    {selectedOrg?.groupMember?.permissions?.includes(
                      OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
                    ) && (
                      <Link href="/platform/team" className="h-auto w-auto">
                        <Button
                          variant="outline"
                          className="flex h-auto w-full flex-col items-center justify-center border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white"
                        >
                          <Users className="mb-2 h-6 w-6" />
                          <span className="text-sm">Invite Team Member</span>
                        </Button>
                      </Link>
                    )}

                    {selectedOrg?.groupMember?.permissions?.includes(
                      OrganizationMemberPermissions.CREATE_PERSONAL_API_KEYS
                    ) && (
                      <Link href="/platform/tokens" className="h-auto w-auto">
                        <Button
                          variant="outline"
                          className="flex h-auto w-full flex-col items-center justify-center border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white"
                        >
                          <Key className="mb-2 h-6 w-6" />
                          <span className="text-sm">Create API Token</span>
                        </Button>
                      </Link>
                    )}

                    {selectedOrg?.groupMember?.permissions?.includes(
                      OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
                    ) && (
                      <Link href="/platform/billing" className="h-auto w-auto">
                        <Button
                          variant="outline"
                          className="flex h-auto w-full flex-col items-center justify-center border-slate-800 bg-slate-900 p-4 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white"
                        >
                          <Zap className="mb-2 h-6 w-6" />
                          <span className="text-sm">Upgrade Plan</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 h-75 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Usage This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    {isTotalUsageEmpty && (
                      <p className="text-sm text-slate-400">No usage data</p>
                    )}

                    {!isTotalUsageEmpty &&
                      (usageData?.totalUsage || [])?.length > 0 && (
                        <div className="flex h-full items-end justify-between">
                          {(usageData?.totalUsage || []).map((day, i) => (
                            <div
                              key={i}
                              className="flex w-full flex-col items-center"
                            >
                              <div className="relative w-full px-1">
                                <div
                                  className="w-full rounded-t bg-gradient-to-t from-blue-500 to-purple-600"
                                  style={{
                                    height: `${(day.count / maxValue) * 150}px`,
                                  }}
                                ></div>
                              </div>
                              <div className="mt-2 text-xs text-slate-400">
                                {dayjs(day.date).format("MMM D")}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* current plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm h-75">
                <CardHeader>
                  <CardTitle className="text-lg ">Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="rounded-lg border border-slate-800 text-white bg-slate-900 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {!!ocrSubscription ? "Pay As You Go" : "Free Plan"}
                      </h3>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        Current
                      </Badge>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">
                        $
                        {!!ocrSubscription
                          ? ocrProduct?.metadata?.pricePerUnit
                          : "0"}{" "}
                        <span className="text-sm text-slate-400">/month</span>
                      </div>
                      <p className="text-sm text-slate-400">
                        100 free pages included
                      </p>
                    </div>

                    <Link href="/platform/billing">
                      {selectedOrg?.groupMember?.permissions?.includes(
                        OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
                      ) && !ocrSubscription ? (
                        <Button className="text-slate-50 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          Upgrade Plan
                        </Button>
                      ) : (
                        <Button className="text-slate-50 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          Manage Subscription
                        </Button>
                      )}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
