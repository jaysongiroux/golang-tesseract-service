"use client";

import { ReactNode, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function CodeBlock({
  language,
  code,
  codeString,
  className,
}: {
  language: string;
  code: ReactNode | string;
  codeString?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyableCode = typeof code === "string" ? code : codeString;

  const copyToClipboard = async () => {
    if (!copyableCode) return;
    await navigator.clipboard.writeText(copyableCode);
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
        {copyableCode && (
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
        )}
      </div>

      {typeof code === "string" ? (
        <div className="px-4 py-2">
          <pre className="whitespace-pre-wrap w-full">
            <code
              className={cn(
                "text-slate-300 text-sm",
                language && `language-${language}`
              )}
            >
              {code}
            </code>
          </pre>
        </div>
      ) : (
        <div>{code}</div>
      )}
    </div>
  );
}
