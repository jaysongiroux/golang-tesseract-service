"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { SignOutButton } from "./sign-out-button";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, User } from "lucide-react";

export function AuthStatus() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center px-3 py-2">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-x-2">
        <Link
          href="/auth/login"
          className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar>
          <User className="h-5 w-5" />
        </Avatar>
        <div className="text-sm">
          <p className="font-medium text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>
      <SignOutButton />
    </div>
  );
}
