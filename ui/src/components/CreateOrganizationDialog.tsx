"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createOrganizationSchema } from "@/utils/zodSchema";
import { useUser } from "@/providers";
import {
  createOrganizationResponse,
  updateOrganizationResponse,
} from "@/app/api/protected/organizations/types";
import { Organization } from "@prisma/client";

interface CreateOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  isEdit?: boolean;
  currentOrganization?: Organization;
}

export function CreateOrganizationDialog({
  open,
  onClose,
  isEdit = false,
  currentOrganization,
}: CreateOrganizationDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setSelectedOrg, refreshOrganizations } = useUser();

  useEffect(() => {
    if (isEdit && currentOrganization) {
      setName(currentOrganization.name);
      setEmail(currentOrganization.email);
    }
  }, [isEdit, currentOrganization]);

  const handleClose = () => {
    setName("");
    setEmail("");
    setError("");
    onClose();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/protected/organizations", {
        method: "PUT",
        body: JSON.stringify({ id: currentOrganization?.id, name }),
      });

      const data = (await resp.json()) as updateOrganizationResponse;

      if ("error" in data) {
        setError(data.error);
      } else {
        const foundOrgs = await refreshOrganizations();
        if (!foundOrgs) {
          setError("Failed to refresh organizations");
          return;
        }
        const foundOrg = foundOrgs?.find(
          (org) => org.id === currentOrganization?.id
        );
        if (!foundOrg) {
          setError("Organization not found");
          return;
        }
        setName("");
        setEmail("");
        setSelectedOrg(foundOrg);
        handleClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create organization. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      // In a real app, you would call an API to create the organization
      const resp = await fetch("/api/protected/organizations", {
        method: "POST",
        body: JSON.stringify({ name, email }),
      });
      const data = (await resp.json()) as createOrganizationResponse;
      if ("error" in data) {
        setError(data.error);
      } else {
        const foundOrgs = await refreshOrganizations();
        if (!foundOrgs) return;
        const foundOrg = foundOrgs?.find(
          (org) => org.id === data.organization.id
        );
        if (!foundOrg) return;
        setSelectedOrg(foundOrg);
        handleClose();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to create organization. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isEdit) {
      handleEdit(e);
    } else {
      handleCreate(e);
    }
  };

  const submitDisabled = useMemo(() => {
    const result = createOrganizationSchema.safeParse({ name, email });
    return !result.success;
  }, [name, email]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        handleClose();
      }}
    >
      <DialogContent className="border-slate-800 bg-slate-950 text-slate-50 sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Organization" : "Create Organization"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isEdit
                ? "Edit the name of your organization"
                : "Create a new organization to collaborate with your team."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                disabled={isLoading}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:border-blue-500"
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Organization Email</Label>
              {/* TODO: add ability to change email */}
              <Input
                disabled={isLoading || isEdit}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:border-blue-500"
                placeholder="Enter organization email"
              />
              <div className="text-xs text-slate-400">
                This email will be used to send invoices and other important
                notifications to the organization.
              </div>
            </div>
          </div>

          {error && <div className="text-sm mb-4 text-red-500">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || submitDisabled}
              className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : isEdit ? (
                "Edit Organization"
              ) : (
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
