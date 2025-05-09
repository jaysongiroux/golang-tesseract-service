import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useCallback, useEffect, useState } from "react";
import {
  acceptDenyInviteResponse,
  getInvitesResponse,
} from "@/app/api/protected/organization/invites/actions/types";
import { useUser } from "@/providers";
import { toast } from "sonner";

const UserInvitesCard = () => {
  const { refreshOrganizations } = useUser();

  const [invites, setInvites] = useState<getInvitesResponse["invites"]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvites = useCallback(async () => {
    setInvitesLoading(true);
    const resp = await fetch(
      `/api/protected/organization/invites/actions?limit=10&offset=${page * 10}`
    );
    const data = (await resp.json()) as getInvitesResponse;
    setInvites(data.invites);
    setHasMore(data.limit <= data.invites.length);
    setInvitesLoading(false);
  }, [page]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites, page]);

  const handleAcceptInvite = async (inviteId: string) => {
    setActionLoading(true);
    const resp = await fetch(`/api/protected/organization/invites/actions`, {
      method: "POST",
      body: JSON.stringify({
        inviteId,
      }),
    });
    const data = (await resp.json()) as acceptDenyInviteResponse;
    if ("error" in data) {
      const errorMessage =
        data.error || "Failed to accept invite. Please try again.";
      toast.error(errorMessage);
    } else {
      await refreshOrganizations();
      await fetchInvites();
      toast.success("Invite accepted");
    }
    setActionLoading(false);
  };

  const handleDenyInvite = async (inviteId: string) => {
    setActionLoading(true);
    const resp = await fetch(`/api/protected/organization/invites/actions`, {
      method: "DELETE",
      body: JSON.stringify({
        inviteId,
      }),
    });
    const data = (await resp.json()) as acceptDenyInviteResponse;
    if ("error" in data) {
      const errorMessage =
        data.error || "Failed to deny invite. Please try again.";
      toast.error(errorMessage);
    } else {
      await refreshOrganizations();
      await fetchInvites();
      toast.success("Invite denied");
    }
    setActionLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invites</CardTitle>
        <CardDescription>Invitations to join an organization</CardDescription>
      </CardHeader>
      <CardContent>
        {invitesLoading && !invites?.length ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {invites.length === 0 && (
              <p className="text-slate-400 text-sm">No invites found</p>
            )}

            {invites.map((invite) => (
              <div
                key={invite.id}
                className="w-full flex justify-between rounded-lg border border-slate-800 bg-slate-900 p-4 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-medium">
                    {invite.organization.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {invite.organization._count.OrganizationMember.toLocaleString()}{" "}
                    members
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    disabled={actionLoading}
                    onClick={() => handleAcceptInvite(invite.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    disabled={actionLoading}
                    onClick={() => handleDenyInvite(invite.id)}
                  >
                    Deny
                  </Button>
                </div>
              </div>
            ))}

            {/* pagination */}
            {invites.length > 0 && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 0 || actionLoading}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  disabled={!hasMore || actionLoading}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInvitesCard;
