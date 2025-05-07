"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { ExtendedUser } from "@/lib/types";
import { OrganizationsResponse } from "@/app/api/protected/organizations/types";
import { OrganizationMemberAPIKeysResponse } from "@/app/api/protected/organization/tokens/types";
import { UsageResponse } from "@/app/api/protected/usage/types";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

type ExtendedOrganization = OrganizationsResponse[number];

interface UserContextType {
  organizations: ExtendedOrganization[];
  selectedOrg: ExtendedOrganization | null;
  setSelectedOrg: (org: ExtendedOrganization | null) => void;
  isLoading: boolean;
  error: string | null;
  sessionUser: ExtendedUser | undefined;
  tokens: OrganizationMemberAPIKeysResponse["tokens"];
  refreshOrganizations: () => Promise<ExtendedOrganization[] | undefined>;
  refreshTokens: () => Promise<void>;
  usageData: UsageResponse | null;
  refreshUsageData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<Session["user"] | null>(null);

  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => {
      setSessionUser(null);
      router.push("/");
    },
  });

  useEffect(() => {
    if (JSON.stringify(sessionUser) !== JSON.stringify(session?.user)) {
      setSessionUser(session?.user);
    }
  }, [sessionUser, session?.user]);

  const [organizations, setOrganizations] = useState<ExtendedOrganization[]>(
    []
  );
  const [tokens, setTokens] = useState<
    OrganizationMemberAPIKeysResponse["tokens"]
  >([]);
  const [selectedOrg, setSelectedOrg] = useState<ExtendedOrganization | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);

  // Function to fetch organizations
  const fetchOrganizations = async () => {
    // Only fetch if user is logged in
    if (!sessionUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/protected/organizations");

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = (await response.json()) as OrganizationsResponse;

      setOrganizations(data);

      if (data.length > 0 && !selectedOrg) {
        const selectedOrgId = localStorage.getItem("selectedOrg");
        if (selectedOrgId) {
          const foundOrg = data.find((org) => org.id === selectedOrgId);
          if (foundOrg) {
            setSelectedOrg(foundOrg);
          } else {
            setSelectedOrg(data[0]);
          }
        } else {
          setSelectedOrg(data[0]);
        }
      } else {
        localStorage.removeItem("selectedOrg");
        setSelectedOrg(null);
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch API tokens
  const fetchAPITokens = useCallback(async () => {
    if (!sessionUser || !selectedOrg) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/protected/organization/tokens?organizationId=${selectedOrg.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }

      const data = await response.json();
      setTokens(data.tokens);

      return data.tokens;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching tokens:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrg, sessionUser]);

  const refreshUsageData = useCallback(async () => {
    if (!selectedOrg) {
      setUsageData(null);
      return;
    }

    const response = await fetch(
      `/api/protected/usage?timeframe=week&organizationId=${selectedOrg?.id}`
    );
    const data = await response.json();
    setUsageData(data);
  }, [selectedOrg]);

  // Public function to refresh tokens
  const refreshTokens = useCallback(async () => {
    return await fetchAPITokens();
  }, [fetchAPITokens]);

  // sync the selected org in local storage
  useEffect(() => {
    if (selectedOrg) {
      localStorage.setItem("selectedOrg", selectedOrg.id);
    }
  }, [selectedOrg]);

  // Fetch organizations when session changes
  useEffect(() => {
    if (sessionUser?.id) {
      fetchOrganizations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.id]);

  // Fetch tokens when selected organization changes
  useEffect(() => {
    if (selectedOrg) {
      fetchAPITokens();
    } else {
      setTokens([]);
    }
  }, [fetchAPITokens, selectedOrg]);

  useEffect(() => {
    refreshUsageData();
  }, [refreshUsageData]);

  const value = {
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading,
    error,
    sessionUser: sessionUser as ExtendedUser | undefined,
    tokens,
    refreshOrganizations: fetchOrganizations,
    refreshTokens,
    usageData,
    refreshUsageData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
