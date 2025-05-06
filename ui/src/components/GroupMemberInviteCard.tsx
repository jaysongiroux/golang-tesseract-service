import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { useState } from "react";
import { MoreHorizontal, Search, Users } from "lucide-react";
import { OrganizationMemberPermissions } from "@prisma/client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { PERMISSIONS_MAP } from "@/utils/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useUser } from "@/providers";

type GroupMemberInviteCardProps = {
  title: string;
  titleDescription: string;
  searchable?: boolean;
  rows: {
    id: string;
    name: string | null;
    email: string;
    permissions: OrganizationMemberPermissions[];
    memberOrInvite: "member" | "invite";
  }[];
  authedUserPermissions: OrganizationMemberPermissions[];
  hasMore: boolean;
  handleLoadMore: () => void;
  handleResendInvitation: (inviteId: string) => void;
  handleRemoveInvitation: (inviteId: string) => void;
  handleRemoveMember: (memberId: string) => void;
  handleEditInvitePermissions: (inviteId: string) => void;
  handleEditMemberPermissions: (memberId: string) => void;
  handleLeaveOrganization: () => void;
};

const GroupMemberInviteCard = ({
  title,
  titleDescription,
  searchable,
  rows,
  authedUserPermissions,
  hasMore,
  handleLoadMore,
  handleResendInvitation,
  handleRemoveInvitation,
  handleRemoveMember,
  handleEditInvitePermissions,
  handleEditMemberPermissions,
  handleLeaveOrganization,
}: GroupMemberInviteCardProps) => {
  const { sessionUser: user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = (rows || []).filter(
    (member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const permissionBadgeColor = (numberOfPermissions: number) => {
    switch (numberOfPermissions) {
      case 1:
      case 2:
        return "bg-purple-500/20 text-purple-400";
      case 3:
      case 4:
        return "bg-blue-500/20 text-blue-400";
      case 5:
      case 6:
        return "bg-green-500/20 text-green-400";
      case 7:
      case 8:
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{titleDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {searchable && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search members..."
                className="border-slate-800 bg-slate-950/50 pl-10 text-slate-50 placeholder:text-slate-400 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
              >
                <div className="flex items-center">
                  <Avatar className="mr-4 h-10 w-10 border border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-slate-400">
                      {member?.name?.charAt(0).toUpperCase() ||
                        member?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {member?.name && (
                      <h3 className="font-medium text-white">{member.name}</h3>
                    )}
                    <p className="text-sm text-slate-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          className={permissionBadgeColor(
                            member.permissions.length
                          )}
                        >
                          {member.permissions?.length} Permissions
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className={"text-slate-50 bg-slate-950"}>
                        <div className="flex flex-col gap-2 pb-4">
                          <div className="text-lg text-slate-100">
                            Permissions
                          </div>
                          <div className="w-full h-[2px] bg-slate-800" />
                          {member.permissions?.map((permission) => (
                            <div key={permission}>
                              <div className="text-2xs text-slate-100">
                                {permission.replaceAll("_", " ")}
                              </div>
                              <div className="text-2xs text-slate-400">
                                {PERMISSIONS_MAP[permission]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {authedUserPermissions?.includes(
                    OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
                  ) && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-slate-800 bg-slate-950 text-slate-50"
                        >
                          {user?.email !== member.email && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (member.memberOrInvite === "invite") {
                                  handleEditInvitePermissions(member.id);
                                } else {
                                  handleEditMemberPermissions(member.id);
                                }
                              }}
                              className="hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900"
                            >
                              Change Permissions
                            </DropdownMenuItem>
                          )}

                          {member.email === user?.email &&
                            member.memberOrInvite === "member" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  handleLeaveOrganization();
                                }}
                                className="text-red-500 hover:bg-slate-900 hover:text-red-500 focus:bg-slate-900"
                              >
                                Leave Organization
                              </DropdownMenuItem>
                            )}
                          {member.memberOrInvite === "invite" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  handleResendInvitation(member.id);
                                }}
                                className="hover:bg-slate-900 hover:text-slate-50 focus:bg-slate-900"
                              >
                                Resend Invitation
                              </DropdownMenuItem>
                              {user?.email !== member.email && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    handleRemoveInvitation(member.id);
                                  }}
                                  className="text-red-500 hover:bg-slate-900 hover:text-red-500 focus:bg-slate-900"
                                >
                                  Remove Invitation
                                </DropdownMenuItem>
                              )}
                            </>
                          )}

                          {member.memberOrInvite === "member" &&
                            user?.email !== member.email && (
                              <DropdownMenuItem
                                onClick={() => {
                                  handleRemoveMember(member.id);
                                }}
                                className="text-red-500 hover:bg-slate-900 hover:text-red-500 focus:bg-slate-900"
                              >
                                Remove Member
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            {hasMore && (
              <Button
                type="submit"
                className="w-full bg-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={handleLoadMore}
                disabled={!hasMore}
              >
                Load More
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
            <Users className="mb-2 h-10 w-10 text-slate-500" />
            <h3 className="mb-1 text-lg font-medium text-slate-50">
              No team members found
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              {searchQuery
                ? `No team members matching "${searchQuery}"`
                : "You haven't added any team members yet"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupMemberInviteCard;
