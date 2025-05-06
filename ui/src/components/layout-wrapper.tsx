"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlatformPage = pathname.startsWith("/platform");

  return (
    <>
      {!isPlatformPage && <Navbar />}
      {children}
      {!isPlatformPage && <Footer />}
    </>
  );
}
