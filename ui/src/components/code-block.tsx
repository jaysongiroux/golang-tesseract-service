"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function CodeBlock({
  language,
  code,
  className,
}: {
  language: string;
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-slate-800 bg-slate-950",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-medium text-slate-400">{language}</span>
        <Button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 rounded p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Copy code"
          variant="ghost"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>

      <div className="px-4 py-2">
        <code
          className={cn(
            "text-slate-300 text-sm",
            language && `language-${language}`
          )}
        >
          {code}
        </code>
      </div>
    </div>
  );
}
