"use client";

import React from "react";
import { NextAuthProvider } from "./authProvider";
import { UserProvider } from "./userProvider";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider defaultTheme="dark" attribute="class">
      <NextAuthProvider>
        <UserProvider>{children}</UserProvider>
      </NextAuthProvider>
    </NextThemesProvider>
  );
}

export * from "./userProvider";
