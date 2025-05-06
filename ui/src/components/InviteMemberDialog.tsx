import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { useUser } from "@/providers";
import { useForm } from "react-hook-form";
import { isDirty, z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationMemberPermissions,
} from "@prisma/client";
import { PERMISSIONS_MAP } from "@/utils/constants";
import { inviteMemberClientSchema } from "@/utils/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import {
  editInviteResponse,
  inviteMemberResponse,
} from "@/app/api/protected/organization/invites/types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { EditOrganizationMemberResponse } from "@/app/api/protected/organization/members/types";

const permissions = Object.keys(PERMISSIONS_MAP)
  .map((permission) => ({
    label: PERMISSIONS_MAP[permission as OrganizationMemberPermissions],
    id: permission,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export type InviteMemberDialogProps = {
  onInvite: (
    invitation:
      | OrganizationInvitation
      | (OrganizationMember & { user: { name: string; email: string } })
  ) => void;
  isEdit?: boolean;
  currentPermissions?: OrganizationMemberPermissions[];
  open: boolean;
  setOpen: (open: boolean) => void;
  type: "invite" | "member";
  currentMemberId: string;
  currentInviteId: string;
  currentEmail: string;
};

const InviteMemberDialog = ({
  onInvite,
  isEdit = false,
  currentPermissions,
  type,
  currentMemberId,
  currentEmail,
  currentInviteId,
  open = false,
  setOpen,
}: InviteMemberDialogProps) => {
  const { selectedOrg } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof inviteMemberClientSchema>>({
    reValidateMode: "onChange",
    mode: "all",
    resolver: zodResolver(inviteMemberClientSchema),
    defaultValues: {
      email: "",
      permissions: [],
    },
  });

  const {
    formState: { isValid },
  } = form;

  useEffect(() => {
    if (currentEmail) {
      form.setValue("email", currentEmail);
    }

    if (currentPermissions) {
      form.setValue("permissions", currentPermissions);
    }
  }, [currentEmail, currentPermissions, form]);

  const handleEditMember = async (
    data: z.infer<typeof inviteMemberClientSchema>
  ) => {
    try {
      setIsLoading(true);

      const resp = await fetch("/api/protected/organization/members", {
        method: "PATCH",
        body: JSON.stringify({
          memberId: currentMemberId,
          permissions: data.permissions,
        }),
      });

      const res = (await resp.json()) as EditOrganizationMemberResponse;

      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Member updated successfully");
        form.reset();
        await onInvite(res.member);
        setOpen(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to edit member";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInvite = async (
    formData: z.infer<typeof inviteMemberClientSchema>
  ) => {
    try {
      setIsLoading(true);

      const resp = await fetch("/api/protected/organization/invites", {
        method: "PATCH",
        body: JSON.stringify({
          permissions: formData.permissions,
          inviteId: currentInviteId,
        }),
      });

      const data = (await resp.json()) as editInviteResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        toast.success("Invitation updated successfully");
        form.reset();
        await onInvite(data.invitation);
        setOpen(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to edit invite";
      toast.error(errorMessage);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (
    data: z.infer<typeof inviteMemberClientSchema>
  ) => {
    try {
      setIsLoading(true);
      const resp = await fetch("/api/protected/organization/invites", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          organizationId: selectedOrg?.id,
        }),
      });

      const res = (await resp.json()) as inviteMemberResponse;

      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Invitation sent successfully");
        form.reset();
        await onInvite(res.invitation);
        setOpen(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";
      toast.error(errorMessage);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof inviteMemberClientSchema>
  ) => {
    if (isEdit) {
      if (type === "member") {
        await handleEditMember(data);
      } else {
        await handleEditInvite(data);
      }
    } else {
      await handleInvite(data);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-slate-800 bg-slate-950 text-slate-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? type === "member"
                ? "Edit Member Permissions"
                : "Edit Invite Permissions"
              : "Invite Team Member"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Invite a new team member to collaborate in {selectedOrg?.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Input {...field} disabled={isEdit} placeholder="Email" />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <FormLabel className="text-sm font-normal">Permissions</FormLabel>
              {permissions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <FormItem
                      key={permission.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(
                            permission.id as OrganizationMemberPermissions
                          )}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, permission.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== permission.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {permission.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!isValid || !isDirty || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Invitation
                  </div>
                ) : isEdit ? (
                  currentInviteId ? (
                    "Update Invite"
                  ) : (
                    "Update Member"
                  )
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberDialog;
