"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Key, Plus, Trash2, X } from "lucide-react";
import { useUser } from "@/providers";
import {
  CreateOrganizationMemberAPIKeyResponse,
  DeleteOrganizationMemberAPIKeyResponse,
  OrganizationMemberAPIKeysResponse,
} from "@/app/api/protected/organization/tokens/types";
import dayjs from "dayjs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrganizationMemberAPIKeyScope } from "@prisma/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { newAPITokenSchema } from "@/utils/zodSchema";
import Link from "next/link";

const expirationOptions = [
  {
    label: "One Week",
    value: "one_week",
  },
  {
    label: "One Month",
    value: "one_month",
  },
  {
    label: "Six Months",
    value: "six_months",
  },
  {
    label: "One Year",
    value: "one_year",
  },
  {
    label: "No Expiration",
    value: "no_expiration",
  },
];

export default function TokensPage() {
  const { selectedOrg, tokens, refreshTokens } = useUser();

  const [copied, setCopied] = useState(false);
  const [newToken, setNewToken] = useState<{
    name: string;
    scopes: OrganizationMemberAPIKeyScope[];
    expirationDate: string | null;
  }>({
    name: "",
    scopes: [],
    expirationDate: null,
  });
  const [generatedToken, setGeneratedToken] = useState<{
    name: string;
    token: string;
    expiresAt: Date | null;
  } | null>(null);

  const parseExpirationDate = (expirationEnum: string | null) => {
    let expirationDate: string | null = null;
    switch (expirationEnum) {
      case "one_week":
        expirationDate = dayjs().add(1, "week").toISOString();
        break;
      case "one_month":
        expirationDate = dayjs().add(1, "month").toISOString();
        break;
      case "six_months":
        expirationDate = dayjs().add(6, "months").toISOString();
        break;
      case "one_year":
        expirationDate = dayjs().add(1, "year").toISOString();
        break;
      case "no_expiration":
        expirationDate = null;
        break;
    }
    return expirationDate;
  };

  const handleCreateToken = async () => {
    try {
      const expirationDate = parseExpirationDate(newToken.expirationDate);
      const resp = await fetch("/api/protected/organization/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newToken.name,
          scopes: newToken.scopes,
          organizationId: selectedOrg?.id,
          ...(expirationDate && {
            expirationDate: expirationDate,
          }),
        }),
      });

      const data =
        (await resp.json()) as CreateOrganizationMemberAPIKeyResponse;

      if ("error" in data) {
        toast.error("Uh Oh", {
          description: data.error,
          duration: 5000,
        });
        return;
      }

      setGeneratedToken({
        name: data.createdToken.name,
        token: data.oneTimeToken,
        expiresAt: data.createdToken.expiresAt,
      });

      await refreshTokens();

      setNewToken({
        name: "",
        scopes: [],
        expirationDate: null,
      });

      toast.success("Token created successfully", {
        description: "This will be displayed only once",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast.error("Uh Oh", {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const createTokenDisabled = useMemo(() => {
    const result = newAPITokenSchema.safeParse({
      ...newToken,
      expirationDate: parseExpirationDate(newToken.expirationDate),
    });

    return !result.success;
  }, [newToken]);

  const handleDeleteToken = async (tokenId: string) => {
    const resp = await fetch(
      `/api/protected/organization/tokens?tokenId=${tokenId}&organizationId=${selectedOrg?.id}`,
      {
        method: "DELETE",
      }
    );

    const data = (await resp.json()) as DeleteOrganizationMemberAPIKeyResponse;
    if ("error" in data) {
      const errorMessage = data.error ? data.error : "An error occurred";
      toast.error("Uh Oh", {
        description: errorMessage,
        duration: 5000,
      });
      return;
    }

    if (data.success) {
      await refreshTokens();
      toast.success("Token deleted successfully");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken?.token || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTokenExpired = (
    token: OrganizationMemberAPIKeysResponse["tokens"][0]
  ) => {
    return token.expiresAt && dayjs(token.expiresAt).isBefore(dayjs());
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">API Tokens</h1>
          <p className="text-slate-400">
            Manage your API tokens for accessing the{" "}
            {process.env.NEXT_PUBLIC_PRODUCT_NAME} API
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Token
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-slate-800 bg-slate-950 text-slate-50 sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Create a new API token</AlertDialogTitle>
              <AlertDialogDescription>
                Generate a new API token to access the{" "}
                {process.env.NEXT_PUBLIC_PRODUCT_NAME} API
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="token-name">Token Name</Label>
                <Input
                  id="token-name"
                  placeholder="e.g. Production API"
                  className="border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:border-blue-500"
                  value={newToken.name}
                  onChange={(e) =>
                    setNewToken({ ...newToken, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Token Expiration</Label>
                <Select
                  onValueChange={(value) => {
                    setNewToken({
                      ...newToken,
                      expirationDate: value,
                    });
                  }}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:border-blue-500">
                    <SelectValue placeholder="Select Expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    {expirationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Token Scope</Label>
                <div className="space-y-2">
                  {Object.values(OrganizationMemberAPIKeyScope).map(
                    (scope: OrganizationMemberAPIKeyScope) => (
                      <div className="flex items-center space-x-2" key={scope}>
                        <Checkbox
                          id={scope}
                          checked={newToken.scopes.includes(scope)}
                          onCheckedChange={(checked) =>
                            setNewToken({
                              ...newToken,
                              scopes: checked
                                ? [...newToken.scopes, scope]
                                : newToken.scopes.filter((s) => s !== scope),
                            })
                          }
                        />
                        <Label htmlFor={scope} className="text-sm font-normal">
                          Allow access to:{" "}
                          <strong>{scope.replaceAll("SERVICE_", "")}</strong>
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="submit"
                  className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={handleCreateToken}
                  disabled={createTokenDisabled}
                >
                  Generate Token
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {generatedToken && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Alert className="border-yellow-500/20 bg-yellow-300/10">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => setGeneratedToken(null)}
            >
              <X className="h-4 w-4 text-yellow-500" />
            </Button>
            <AlertTitle className="text-lg font-bold text-yellow-500">
              New API token created
            </AlertTitle>
            <AlertDescription className="text-yellow-500">
              <p className="mb-2 text-md">
                This token will only be displayed once. Please copy it and store
                it securely.
              </p>
              {/* full width on small and half width on medium */}
              <div className="mt-2 flex w-full items-center space-x-2 md:w-1/2">
                <Input
                  value={generatedToken.token}
                  readOnly
                  className="border-slate-800 bg-slate-900 font-mono text-md text-slate-50 w-full"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Your API Tokens</CardTitle>
          <CardDescription>Manage your existing API tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex items-center">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                      <Key className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{token.name}</h3>
                        <span className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">
                            *******
                          </span>
                          <span className="text-xs text-slate-400">
                            {token.lastChars}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <span>
                          Created:{" "}
                          {dayjs(token.createdAt).format("MMMM D, YYYY")}
                        </span>
                        {token.expiresAt && !isTokenExpired(token) && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              Expires:{" "}
                              {dayjs(token.expiresAt).format("MMMM D, YYYY")}
                            </span>
                          </>
                        )}

                        {isTokenExpired(token) && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-red-500">
                              Expired:{" "}
                              {dayjs(token.expiresAt).format("MMMM D, YYYY")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {(token?.scope || [])?.map((scope) => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className="border-slate-700 bg-slate-800 text-slate-300"
                        >
                          {scope.replaceAll("SERVICE_", "")}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => handleDeleteToken(token.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-8 text-center">
              <Key className="mb-2 h-10 w-10 text-slate-500" />
              <h3 className="mb-1 text-lg font-medium text-slate-50">
                No API tokens
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                You haven&apos;t created any API tokens yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">API Documentation</CardTitle>
            <CardDescription>
              Learn how to use the {process.env.NEXT_PUBLIC_PRODUCT_NAME} API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-400">
              Our comprehensive API documentation provides all the information
              you need to integrate {process.env.NEXT_PUBLIC_PRODUCT_NAME} into
              your applications.
            </p>
            <Link
              href={
                process.env.NEXT_PUBLIC_SERVICE_BACKEND_URL +
                "/swagger/index.html"
              }
            >
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                View Documentation
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">API Usage</CardTitle>
            <CardDescription>Monitor your API usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="mb-4 text-sm text-slate-400">
              You&apos;ve used{" "}
              <span className="font-medium text-blue-400">
                {selectedOrg?.numberOfPagesProcessed}
              </span>{" "}
              out of <span className="font-medium">100</span> pages this month.
            </p>

            <Progress
              value={selectedOrg?.numberOfPagesProcessed || 0}
              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600"
              className="bg-slate-800"
            />

            <p className="text-xs text-slate-400">
              {100 - (selectedOrg?.numberOfPagesProcessed || 0)} pages remaining
              this month
            </p>

            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              View Usage Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
