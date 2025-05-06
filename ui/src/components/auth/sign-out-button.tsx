"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/", redirect: true })}
      className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white ${
        className ?? ""
      }`}
    >
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </button>
  );
}
