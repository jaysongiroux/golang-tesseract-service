"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const glowVariants = cva("relative overflow-hidden group ", {
  variants: {
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
    },
    variant: {
      default:
        "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",

      destructive:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

const GlowingButton = React.forwardRef(
  (
    {
      asChild,
      className,
      size,
      children,
      variant = "default",
      onClick,
      ...props
    }: {
      asChild?: boolean;
      className?: string;
      size?: "default" | "sm" | "lg";
      children: React.ReactNode;
      disabled?: boolean;
      type?: "button" | "submit" | "reset";
      variant?: "default" | "destructive";
      onClick?: () => void;
    },
    ref
  ) => {
    return (
      <Button
        asChild={asChild}
        className={cn(glowVariants({ size, variant }), className)}
        ref={ref as unknown as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        {...props}
      >
        <span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "absolute h-full w-full  opacity-0 blur-xl transition-opacity duration-500",
                variant === "default" &&
                  "bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70",
                variant === "destructive" &&
                  "bg-gradient-to-r from-red-400 to-red-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"
              )}
            ></span>
          </span>
          <span className="relative z-10">{children}</span>
        </span>
      </Button>
    );
  }
);
GlowingButton.displayName = "GlowingButton";

export { GlowingButton };
