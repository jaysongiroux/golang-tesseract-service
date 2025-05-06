"use client";

import type React from "react";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedText({
  children,
  className,
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & Omit<React.ComponentProps<typeof motion.div>, "onAnimationStart">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
