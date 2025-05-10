"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Building, EllipsisVertical, Plus, Search } from "lucide-react";
import { useUser } from "@/providers";
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Organization, OrganizationMemberPermissions } from "@prisma/client";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { deleteOrganizationResponse } from "@/app/api/protected/organizations/types";
import { toast } from "sonner";
import UserInvitesCard from "@/components/UserInvitesCard";
import { DeleteOrganizationMemberResponse } from "@/app/api/protected/organization/members/types";

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    organizations,
    selectedOrg,
    sessionUser,
    setSelectedOrg,
    refreshOrganizations,
  } = useUser();
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState<{
    name: string;
    id: string;
    email: string;
  } | null>(null);
  const [confirmDetails, setConfirmDetails] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: async () => {},
  });

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeaveOrganization = async (orgId: string) => {
    try {
      setDeleteLoading(true);
      const resp = await fetch(
        `/api/protected/organization/members?memberId=${sessionUser?.id}&organizationId=${orgId}`,
        {
          method: "DELETE",
        }
      );
      const data = (await resp.json()) as DeleteOrganizationMemberResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        await refreshOrganizations();
        toast.success(data.message);
        setConfirmDetails((prev) => ({
          ...prev,
          open: false,
        }));
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteOrganization = async (orgId: string, confirm: boolean) => {
    setDeleteLoading(true);
    const resp = await fetch("/api/protected/organizations", {
      method: "DELETE",
      body: JSON.stringify({ id: orgId, confirm }),
    });
    const data = (await resp.json()) as deleteOrganizationResponse;

    if ("error" in data) {
      if (data?.error.includes("active subscriptions")) {
        setConfirmDetails({
          open: true,
          title: "Delete Organization",
          description: "Are you sure you want to delete this organization?",
          onConfirm: async () => {
            await handleDeleteOrganization(orgId, true);
          },
        });
      } else {
        const errorMessage =
          data.error || "Failed to delete organization. Please try again.";
        toast.error(errorMessage);
      }
    } else {
      if (selectedOrg?.id === orgId) {
        const nextOrg = filteredOrgs?.find((org) => org.id !== orgId);
        setSelectedOrg(nextOrg || null);
      }

      setConfirmDetails((prev) => ({ ...prev, open: false }));
      toast.success("Organization deleted successfully");
      await refreshOrganizations();
    }
    setDeleteLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Organizations</h1>
          <p className="text-slate-400">
            Manage your organizations and team members
          </p>
        </div>
        <Button
          className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          onClick={() => setCreateOrgDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>

      <Card className="mb-8 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your Organizations</CardTitle>
          <CardDescription>
            Organizations you own or are a member of
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search organizations..."
                className="border-slate-800 bg-slate-950/50 pl-10 text-slate-50 placeholder:text-slate-400 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrgs.length > 0 ? (
              filteredOrgs.map((org, index) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all hover:border-blue-500/50 hover:bg-slate-800">
                    <div className="flex items-center">
                      <Avatar className="mr-4 h-10 w-10 border border-slate-700">
                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/platform/`}
                          onClick={() => {
                            setSelectedOrg(org);
                          }}
                        >
                          <div className="flex items-center">
                            <h3 className="font-medium text-white">
                              {org.name}
                            </h3>
                            {selectedOrg?.id === org.id && (
                              <Badge className="ml-2 bg-purple-600 text-white">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-slate-400">
                            <span>
                              Created:{" "}
                              {dayjs(org.createdAt).format("MMMM D, YYYY")}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{org.numberOfMembers} members</span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="hover:bg-slate-900 hover:opacity-80"
                        >
                          <EllipsisVertical className="h-4 w-4 text-slate-200" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 mx-2 bg-slate-800 border-slate-900">
                        <Link
                          href={`/platform/team`}
                          className="cursor-pointer hover:bg-slate-500"
                        >
                          <DropdownMenuLabel className="text-slate-50 hover:bg-slate-900/50 cursor-pointer">
                            Members
                          </DropdownMenuLabel>
                        </Link>
                        {org?.groupMember?.permissions?.includes(
                          OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS
                        ) && (
                          <DropdownMenuLabel
                            onClick={() => {
                              setEditOrgDialogOpen({
                                name: org.name,
                                id: org.id,
                                email: org.email,
                              });
                            }}
                            className="text-slate-50 hover:bg-slate-900/50 cursor-pointer"
                          >
                            Edit
                          </DropdownMenuLabel>
                        )}

                        {org?.groupMember?.permissions?.includes(
                          OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS
                        ) && (
                          <DropdownMenuLabel
                            className="text-red-500 hover:bg-red-300/10 cursor-pointer"
                            onClick={() => {
                              setConfirmDetails({
                                open: true,
                                title: "Delete Organization",
                                description:
                                  "Are you sure you want to delete this organization?",
                                onConfirm: async () => {
                                  await handleDeleteOrganization(org.id, false);
                                },
                              });
                            }}
                          >
                            Delete
                          </DropdownMenuLabel>
                        )}

                        <DropdownMenuLabel
                          className="text-red-500 hover:bg-red-300/10 cursor-pointer"
                          onClick={() => {
                            setConfirmDetails({
                              open: true,
                              title: "Leave Organization",
                              description:
                                "Are you sure you want to leave this organization?",
                              onConfirm: async () => {
                                await handleLeaveOrganization(org.id);
                              },
                            });
                          }}
                        >
                          Leave Organization
                        </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
                <Building className="mb-2 h-10 w-10 text-slate-500" />
                <h3 className="mb-1 text-lg font-medium text-slate-50">
                  No organizations found
                </h3>
                <p className="mb-4 text-sm text-slate-400">
                  {searchQuery
                    ? `No organizations matching "${searchQuery}"`
                    : "You don't have any organizations yet"}
                </p>
                <Button
                  className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => {
                    setCreateOrgDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4 " />
                  Create Organization
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UserInvitesCard />

      <ConfirmDialog
        open={!!confirmDetails.open}
        onClose={() => setConfirmDetails((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDetails.onConfirm}
        title={confirmDetails.title}
        description={confirmDetails.description}
        loading={deleteLoading}
      />
      <CreateOrganizationDialog
        open={createOrgDialogOpen}
        onClose={() => setCreateOrgDialogOpen(false)}
      />
      <CreateOrganizationDialog
        currentOrganization={editOrgDialogOpen as unknown as Organization}
        isEdit={true}
        onClose={() => setEditOrgDialogOpen(null)}
        open={!!editOrgDialogOpen}
      />
    </DashboardLayout>
  );
}
