"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, MouseEvent, useEffect, useRef } from "react";
import { smoothScrollTo } from "@/lib/utils";

interface SmoothScrollLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SmoothScrollLink({
  href,
  children,
  className,
  onClick,
}: SmoothScrollLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Keep track of pending hash scrolls
  const targetHashRef = useRef<string | null>(null);

  // Handle hash scrolling after navigation or on mount
  useEffect(() => {
    // If we have a pending hash scroll, execute it
    if (targetHashRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        smoothScrollTo(targetHashRef.current!);
        targetHashRef.current = null;
      }, 100);

      return () => clearTimeout(timer);
    }

    // Check if URL already has a hash on mount/navigation
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        smoothScrollTo(hash);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick();
    }

    // Check if this is a hash link
    if (href.startsWith("#") || href.includes("/#")) {
      e.preventDefault();

      // Extract the hash
      const hash = href.includes("/#")
        ? href.substring(href.indexOf("/#") + 2)
        : href.substring(1);

      // Get the target page path (everything before the hash)
      const targetPath = href.includes("/#") ? href.split("/#")[0] : pathname;

      // If we're navigating to the same page
      if (targetPath === pathname || targetPath === "" || targetPath === "/") {
        // Just scroll to the hash on current page
        smoothScrollTo(hash);
      } else {
        // Store the hash for after navigation
        targetHashRef.current = hash;
        // Navigate to the new page (without hash to prevent auto-scroll)
        router.push(targetPath);
      }
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
