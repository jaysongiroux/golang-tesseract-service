"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUser } from "@/providers";
import { OrganizationInvitation, OrganizationMember } from "@prisma/client";
import InviteMemberDialog, {
  InviteMemberDialogProps,
} from "@/components/InviteMemberDialog";
import { toast } from "sonner";
import GroupMemberInviteCard from "@/components/GroupMemberInviteCard";
import {
  DeleteOrganizationMemberResponse,
  OrganizationMembersResponse,
} from "@/app/api/protected/organization/members/types";
import {
  deleteInvitationResponse,
  getOrganizationInvitesResponse,
  inviteMemberResponse,
} from "@/app/api/protected/organization/invites/types";
import ConfirmDialog, { ConfirmDialogProps } from "@/components/ConfirmDialog";

const LIMIT = 30;

type OrganizationMemberWithUser = OrganizationMember & {
  user: {
    name: string;
    email: string;
  };
};

type OrganizationInvitationWithUser = OrganizationInvitation;

export default function TeamPage() {
  const { selectedOrg, sessionUser } = useUser();
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreInvites, setHasMoreInvites] = useState(false);
  const [teamMembers, setTeamMembers] = useState<OrganizationMemberWithUser[]>(
    []
  );
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState<
    Omit<InviteMemberDialogProps, "setOpen">
  >({
    open: false,
    isEdit: false,
    currentPermissions: [],
    onInvite: () => {},
    currentMemberId: "",
    currentInviteId: "",
    currentEmail: "",
    type: "invite",
  });
  const [invites, setInvites] = useState<OrganizationInvitationWithUser[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps>({
    open: false,
    onClose: () => {},
    onConfirm: () => {},
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedOrg) return;

      const response = await fetch(
        `/api/protected/organization/members?organizationId=${selectedOrg.id}&limit=${LIMIT}&offset=0`
      );

      const data = (await response.json()) as OrganizationMembersResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        setTeamMembers(data.members as unknown as OrganizationMemberWithUser[]);
        setHasMore(data.limit < data.members.length);
      }
    };

    fetchTeamMembers();
  }, [selectedOrg]);

  const fetchInvites = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const resp = await fetch(
        `/api/protected/organization/invites?organizationId=${
          selectedOrg?.id
        }&limit=${LIMIT.toString()}&offset=0`
      );

      const data = (await resp.json()) as getOrganizationInvitesResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        setInvites(data.invites);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch invites";
      toast.error(errorMessage);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  const handleLoadMore = async () => {
    if (!hasMore) return;
    if (!selectedOrg) return;

    const response = await fetch(
      `/api/protected/organization/members?organizationId=${selectedOrg.id}&limit=${LIMIT}&offset=${teamMembers.length}`
    );

    const data = (await response.json()) as OrganizationMembersResponse;

    if ("error" in data) {
      toast.error(data.error);
    } else {
      setTeamMembers([
        ...teamMembers,
        ...(data.members as unknown as OrganizationMemberWithUser[]),
      ]);
      setHasMore(data.limit < data.members.length);
    }
  };

  const handleLoadMoreInvites = async () => {
    if (!hasMoreInvites) return;
    if (!selectedOrg) return;

    const response = await fetch(
      `/api/protected/organization/invites?organizationId=${selectedOrg.id}&limit=${LIMIT}&offset=${invites.length}`
    );

    const data = (await response.json()) as getOrganizationInvitesResponse;

    if ("error" in data) {
      toast.error(data.error);
    } else {
      setInvites([
        ...invites,
        ...(data.invites as unknown as OrganizationInvitationWithUser[]),
      ]);
      setHasMoreInvites(data.limit < data.invites.length);
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    if (!selectedOrg) return;

    try {
      const resp = await fetch(
        `/api/protected/organization/invites?inviteId=${inviteId}`,
        {
          method: "DELETE",
        }
      );

      const data = (await resp.json()) as deleteInvitationResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove invite";
      toast.error(errorMessage);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrg) return;

    try {
      const resp = await fetch(
        `/api/protected/organization/members?memberId=${memberId}&organizationId=${selectedOrg?.id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await resp.json()) as DeleteOrganizationMemberResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
        setTeamMembers((prev) =>
          prev.filter((member) => member.userId !== memberId)
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : sessionUser?.id === memberId
            ? "Failed to leave organization"
            : "Failed to remove member";
      toast.error(errorMessage);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    if (!selectedOrg) return;

    try {
      const foundInvite = invites?.find((invite) => invite.id === inviteId);
      if (!foundInvite) return;

      const resp = await fetch(
        `/api/protected/organization/invites?inviteId=${inviteId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            inviteId,
            email: foundInvite.email,
            permissions: foundInvite.permissions,
          }),
        }
      );

      const data = (await resp.json()) as inviteMemberResponse;

      if ("error" in data) {
        toast.error(data.error);
      } else {
        toast.success(
          data.invitation.authorId + " has been invited to " + selectedOrg?.name
        );
        setInvites((prev) =>
          prev.map((invite) =>
            invite.id === inviteId ? data.invitation : invite
          )
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend invite";
      toast.error(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Team Members</h1>
            <p className="text-slate-400">
              Manage your team members and their permissions
            </p>
          </div>
          <Button
            className="bg-gradient-to-r text-slate-50 from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => {
              setPermissionsDialogOpen({
                open: true,
                isEdit: false,
                currentPermissions: [],
                onInvite: fetchInvites,
                currentMemberId: "",
                currentInviteId: "",
                type: "invite",
                currentEmail: "",
              });
            }}
          >
            <Plus className="mr-2 h-4 w-4 " />
            Invite Member
          </Button>
        </div>

        <GroupMemberInviteCard
          title="Group Members"
          titleDescription={`Manage group members in ${selectedOrg?.name}`}
          rows={(teamMembers || []).map((row) => ({
            id: row.userId,
            name: row.user.name,
            email: row.user.email,
            permissions: row.permissions,
            memberOrInvite: "member",
          }))}
          authedUserPermissions={selectedOrg?.groupMember?.permissions || []}
          hasMore={hasMore}
          searchable={true}
          handleLoadMore={() => {
            handleLoadMore();
          }}
          handleRemoveInvitation={() => {}}
          handleEditInvitePermissions={() => {}}
          handleResendInvitation={() => {}}
          handleEditMemberPermissions={(memberId) => {
            setPermissionsDialogOpen({
              open: true,
              isEdit: true,
              currentMemberId: memberId,
              currentInviteId: "",
              type: "member",
              currentPermissions:
                teamMembers?.find((member) => member.userId === memberId)
                  ?.permissions || [],
              currentEmail:
                teamMembers?.find((member) => member.userId === memberId)?.user
                  .email || "",
              onInvite: (member) => {
                if ("userId" in member) {
                  setTeamMembers((prev) =>
                    // update the member with the new permissions
                    prev.map((m) => (m.userId === member.userId ? member : m))
                  );
                }
              },
            });
          }}
          handleLeaveOrganization={() => {
            if (!selectedOrg) return;

            setConfirmDialog({
              open: true,
              title: "Leave Organization",
              description:
                "Are you sure you want to leave this organization? All content and cache will be removed permanently.",
              onClose: () => {
                setConfirmDialog({
                  ...confirmDialog,
                  open: false,
                });
              },
              onConfirm: () => {
                handleRemoveMember(sessionUser?.id || "");
                setConfirmDialog({
                  ...confirmDialog,
                  open: false,
                });
              },
            });
          }}
          handleRemoveMember={(memberId) => {
            setConfirmDialog({
              open: true,
              title: "Remove Member",
              description: "Are you sure you want to remove this member?",
              onClose: () => {
                setConfirmDialog({
                  ...confirmDialog,
                  open: false,
                });
              },
              onConfirm: () => {
                handleRemoveMember(memberId);
                setConfirmDialog({
                  ...confirmDialog,
                  open: false,
                });
              },
            });
          }}
        />

        <GroupMemberInviteCard
          title="Invites"
          titleDescription={`Manage invites in ${selectedOrg?.name}`}
          rows={(invites || []).map((row) => ({
            id: row.id,
            name: null,
            email: row.email,
            permissions: row.permissions,
            memberOrInvite: "invite",
          }))}
          authedUserPermissions={selectedOrg?.groupMember?.permissions || []}
          hasMore={hasMoreInvites}
          searchable={false}
          handleEditMemberPermissions={() => {}}
          handleRemoveMember={() => {}}
          handleLeaveOrganization={() => {}}
          handleLoadMore={handleLoadMoreInvites}
          handleEditInvitePermissions={(inviteId) => {
            setPermissionsDialogOpen({
              open: true,
              isEdit: true,
              currentInviteId: inviteId,
              currentMemberId: "",
              currentEmail:
                invites?.find((invite) => invite.id === inviteId)?.email || "",
              type: "invite",
              currentPermissions:
                invites?.find((invite) => invite.id === inviteId)
                  ?.permissions || [],
              onInvite: (invite) => {
                if ("id" in invite) {
                  setInvites((prev) =>
                    prev.map((i) => (i.id === invite.id ? invite : i))
                  );
                }
              },
            });
          }}
          handleResendInvitation={handleResendInvite}
          handleRemoveInvitation={(inviteId) => {
            setConfirmDialog({
              open: true,
              title: "Remove Invitation",
              description: "Are you sure you want to remove this invitation?",
              onClose: () => {
                setConfirmDialog({
                  ...confirmDialog,
                  open: false,
                });
              },
              onConfirm: () => {
                handleRemoveInvite(inviteId);
              },
            });
          }}
        />
      </div>

      <ConfirmDialog {...confirmDialog} />
      <InviteMemberDialog
        onInvite={permissionsDialogOpen.onInvite}
        open={permissionsDialogOpen.open}
        setOpen={(open) => {
          setPermissionsDialogOpen({
            ...permissionsDialogOpen,
            open,
          });
        }}
        isEdit={permissionsDialogOpen.isEdit}
        currentPermissions={permissionsDialogOpen.currentPermissions}
        currentMemberId={permissionsDialogOpen.currentMemberId}
        currentInviteId={permissionsDialogOpen.currentInviteId}
        currentEmail={permissionsDialogOpen.currentEmail}
        type={permissionsDialogOpen.type}
      />
    </DashboardLayout>
  );
}
