"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useUser } from "@/providers";
import { useSession } from "next-auth/react";
import { EditProfileResponse } from "@/app/api/protected/profile/edit/types";
import { ChangePasswordResponse } from "@/app/api/auth/change-password/types";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { z } from "zod";
import { passwordSchema } from "@/utils/zodSchema";

export default function ProfileSettingsPage() {
  const { sessionUser: user } = useUser();
  const { update } = useSession();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user?.name as string,
        email: user?.email as string,
      });
    }
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    profile: string | null;
    password: string | null;
  }>({
    profile: null,
    password: null,
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ ...errors, password: null });

    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1),
    });

    const result = schema.safeParse(passwordForm);

    if (!result.success) {
      setErrors({ ...errors, password: result.error.message });
    }

    setIsLoading(true);

    try {
      const resp = await fetch("/api/protected/change-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = (await resp.json()) as ChangePasswordResponse;

      if ("error" in data) {
        const errorMessage =
          data?.error || "Failed to change password. Please try again.";
        toast.error("Uh oh.", {
          description: errorMessage,
          duration: 5000,
        });
        return;
      }

      if (data?.message) {
        toast.success(data.message, {
          description: "Your password has been updated",
          duration: 5000,
        });

        // Reset form after successful password change
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setErrors({ ...errors, password: null });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to change password. Please try again.";
      toast.error("Uh oh.", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeName = async (name: string) => {
    if (name !== user?.name) {
      try {
        setIsLoading(true);
        const resp = await fetch("/api/protected/profile/edit", {
          method: "POST",
          body: JSON.stringify({ name }),
        });

        const data = (await resp.json()) as EditProfileResponse;

        if ("error" in data) {
          toast.error("Uh oh.", {
            description:
              data?.error || "Failed to update name. Please try again.",
            duration: 5000,
          });
          return;
        }

        if (data?.name) {
          await update({ name });
          toast.success("Name updated successfully", {
            description: "Your name has been updated",
            duration: 5000,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to update name. Please try again.";
        toast.error("Uh oh.", {
          description: errorMessage,
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const changePasswordDisabled = useMemo(() => {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1),
    });

    const result = schema.safeParse(passwordForm);

    if (!result.success) {
      return true;
    }

    return false;
  }, [passwordForm]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Profile Settings</h1>
        <p className="text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 border-b border-slate-800 bg-transparent">
          <TabsTrigger
            value="profile"
            className={`border-b-2 border-transparent pb-2 pt-1 ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-400"
                : "text-slate-400"
            }`}
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className={`border-b-2 border-transparent pb-2 pt-1 ${
              activeTab === "security"
                ? "border-blue-500 text-blue-400"
                : "text-slate-400"
            }`}
          >
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors.profile && (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                  {errors.profile}
                </div>
              )}

              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-36 w-36 border-2 border-slate-700">
                    <AvatarFallback className="text-slate-400 text-4xl">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-400">
                      Full Name
                    </Label>
                    <Input
                      disabled={isLoading}
                      id="name"
                      value={profileForm.name}
                      onBlur={async (e) => {
                        const value = e.target.value;
                        await handleChangeName(value);
                      }}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          name: e.target.value,
                        })
                      }
                      className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500 placeholder:text-slate-400 "
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-400">
                      Email Address
                    </Label>
                    <Input
                      disabled={isLoading}
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="border-slate-800 bg-slate-900 text-slate-50 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {errors.password && (
                  <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                    {errors.password}
                  </div>
                )}

                <div className="space-y-4">
                  <PasswordInput
                    disabled={isLoading}
                    isConfirmPassword={true}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    value={passwordForm.currentPassword}
                    error={errors.password}
                    name="currentPassword"
                    label="Current Password"
                  />

                  <PasswordInput
                    disabled={isLoading}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    value={passwordForm.newPassword}
                    error={errors.password}
                    name="newPassword"
                    label="New Password"
                  />

                  <PasswordInput
                    disabled={isLoading}
                    isConfirmPassword={true}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    value={passwordForm.confirmPassword}
                    error={errors.password}
                    name="confirmPassword"
                    label="Confirm Password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || changePasswordDisabled}
                  className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
