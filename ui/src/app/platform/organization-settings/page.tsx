"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlowingButton } from "@/components/GlowingButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { useUser } from "@/providers";
import dayjs from "dayjs";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { Organization } from "@prisma/client";
import ConfirmDialog, { ConfirmDialogProps } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { DeleteOrganizationMemberResponse } from "@/app/api/protected/organization/members/types";

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false);
  const {
    selectedOrg: organization,
    organizations,
    setSelectedOrg,
    refreshOrganizations,
  } = useUser();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps>({
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: "",
    description: "",
  });

  const handleDeleteOrganization = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch("/api/protected/organization", {
        method: "DELETE",
        body: JSON.stringify({ organizationId: organization?.id }),
      });

      const data = (await resp.json()) as DeleteOrganizationMemberResponse;
      if ("error" in data) {
        throw new Error(data.error);
      }

      const nextOrg = organizations.find((org) => org.id !== organization?.id);
      if (nextOrg) {
        setSelectedOrg(nextOrg);
      }

      await refreshOrganizations();

      toast.success(data.message);
      router.push("/platform/organizations");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (
    organization?.groupMember?.permissions.includes(
      "MANAGE_ORGANIZATION_SETTINGS"
    )
  ) {
    return (
      <DashboardLayout>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Organization Settings
            </h1>
            <p className="text-slate-400">
              Manage settings for {organization?.name}
            </p>
          </div>

          <Button
            className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => setEditOrgDialogOpen(true)}
          >
            Edit Organization
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Organization Information</CardTitle>
            <CardDescription>
              View and manage your organization&apos;s basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={organization?.name}
                readOnly
                className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-created">Created On</Label>
              <Input
                id="org-created"
                value={dayjs(organization?.createdAt).format("MMMM D, YYYY")}
                readOnly
                className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-red-500">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 flex flex-col gap-4">
              <h3 className="text-lg font-medium text-red-500">
                Delete Organization
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Once you delete an organization, there is no going back. All
                data associated with this organization will be permanently
                deleted.
              </p>
              <div>
                <GlowingButton
                  variant="destructive"
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      onClose: () =>
                        setConfirmDialog({
                          open: false,
                          onClose: () => {},
                          onConfirm: () => {},
                          title: "",
                          description: "",
                        }),
                      onConfirm: handleDeleteOrganization,
                      title: "Delete Organization",
                      description:
                        "Are you sure you want to delete this organization? This action cannot be undone.",
                    });
                  }}
                  disabled={isLoading}
                >
                  <span className="relative text-slate-50 flex flex-row items-center justify-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Organization
                      </>
                    )}
                  </span>
                </GlowingButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <CreateOrganizationDialog
          open={editOrgDialogOpen}
          onClose={() => setEditOrgDialogOpen(false)}
          isEdit={true}
          currentOrganization={organization as Organization}
        />

        <ConfirmDialog
          {...confirmDialog}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          loading={isLoading}
          onConfirm={() => {
            confirmDialog.onConfirm();
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            You are not authorized to manage this organization
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
