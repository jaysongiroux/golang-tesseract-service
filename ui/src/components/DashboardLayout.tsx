"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CreditCard,
  Home,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  Plus,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useUser } from "@/providers";
import { OrganizationMemberPermissions } from "@prisma/client";
import DashboardNavItem, { DashboardNavDivider } from "./DashboardNavItem";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Use the user context instead of local state
  const {
    sessionUser: user,
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading,
  } = useUser();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const userNavItems = [
    {
      name: "Dashboard",
      href: "/platform",
      icon: <LayoutDashboard className="h-5 w-5" />,
      shouldShow: true,
    },
    {
      name: "Organizations",
      href: "/platform/organizations",
      icon: <Home className="h-5 w-5" />,
      shouldShow: true,
    },
  ];

  const orgNavItems = [
    {
      name: "Team Members",
      withDivider: true,
      href: "/platform/team",
      icon: <Users className="h-5 w-5" />,
      shouldShow:
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_MEMBERS
        ) ||
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.MANAGE_ORGANIZATION_MEMBERS
        ),
    },
    {
      name: "Documents",
      href: "/platform/documents",
      icon: <File className="h-5 w-5" />,
      shouldShow:
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.MANAGE_ORGANIZATION_FILES
        ) ||
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_FILES
        ),
    },
    {
      name: "API Tokens",
      href: "/platform/tokens",
      icon: <Key className="h-5 w-5" />,
      shouldShow: selectedOrg?.groupMember?.permissions?.includes(
        OrganizationMemberPermissions.CREATE_PERSONAL_API_KEYS
      ),
    },
    {
      name: "Billing",
      href: "/platform/billing",
      icon: <CreditCard className="h-5 w-5" />,
      shouldShow:
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.WRITE_ORGANIZATION_BILLING
        ) ||
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.READ_ONLY_ORGANIZATION_BILLING
        ) ||
        selectedOrg?.groupMember?.permissions?.includes(
          OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS
        ),
    },
    {
      name: "Settings",
      href: "/platform/organization-settings",
      icon: <Settings className="h-5 w-5" />,
      shouldShow: selectedOrg?.groupMember?.permissions?.includes(
        OrganizationMemberPermissions.MANAGE_ORGANIZATION_SETTINGS
      ),
    },
  ].filter((item) => item.shouldShow);

  const renderOrgDropdown = () => {
    if (isLoading) {
      return (
        <div className="flex w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900 p-2 text-left text-sm">
          <span className="text-slate-400">Loading organizations...</span>
        </div>
      );
    }

    if (!selectedOrg) {
      return (
        <Link
          href="/platform/organizations"
          className="flex w-full items-center justify-center rounded-md border border-slate-800 bg-slate-900 p-2 text-sm hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Organization</span>
        </Link>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900 p-2 text-left text-sm hover:bg-slate-800">
            <div className="flex items-center">
              <Avatar className="mr-2 h-6 w-6 border border-slate-700">
                <AvatarImage src={""} alt={selectedOrg.name} />
                <AvatarFallback className="bg-slate-800 text-slate-400">
                  {selectedOrg.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedOrg.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 border-slate-800 bg-slate-950 text-slate-50">
          <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              className="hover:bg-slate-900 focus:bg-slate-900"
              onClick={() => setSelectedOrg(org)}
            >
              <div className="flex w-full items-center text-white">
                <Avatar className="mr-2 h-6 w-6 border border-slate-700">
                  <AvatarImage src={""} alt={org.name} />
                  <AvatarFallback className="bg-slate-800 text-slate-400">
                    {org.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-white hover:text-white">
                    {org.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {org.numberOfMembers} members
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem className="hover:bg-slate-900 focus:bg-slate-900">
            <Link
              href="/platform/organizations"
              className="flex w-full items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Organization</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      {/* Mobile Header */}
      <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mr-4 rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <Link href="/platform" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {process.env.NEXT_PUBLIC_PRODUCT_NAME}
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 rounded-full">
                <Avatar className="h-8 w-8 border border-slate-700">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-slate-800 bg-slate-950 text-slate-50"
            >
              <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-slate-400">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="hover:bg-slate-900 focus:bg-slate-900">
                <Link
                  href="/platform/profile"
                  className="flex w-full items-center"
                >
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                className="text-red-500 hover:bg-slate-900 focus:bg-slate-900"
                onClick={() => {
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ ease: "easeOut" }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-slate-950 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <Link href="/platform" className="flex items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {process.env.NEXT_PUBLIC_PRODUCT_NAME}
                  </span>
                </Link>
              </div>

              <div className="mb-6">{renderOrgDropdown()}</div>

              <nav className="space-y-1">
                {userNavItems.map((item) => (
                  <DashboardNavItem key={item.name} {...item} />
                ))}

                <DashboardNavDivider />

                {orgNavItems.map((item) => (
                  <DashboardNavItem key={item.name} {...item} />
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-md transition-all duration-300 lg:block ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link href="/platform" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {process.env.NEXT_PUBLIC_PRODUCT_NAME}
            </span>
          </Link>
        </div>

        <div className="p-4">
          <div className="mb-6">{renderOrgDropdown()}</div>

          <nav className="space-y-1">
            {userNavItems.map((item) => (
              <DashboardNavItem key={item.name} {...item} />
            ))}

            <DashboardNavDivider />

            {orgNavItems.map((item) => (
              <DashboardNavItem key={item.name} {...item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`min-h-screen pt-16 transition-all duration-300 lg:pt-0 ${
          isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md lg:flex">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 rounded-full">
                  <Avatar className="h-8 w-8 border border-slate-700">
                    <AvatarImage src={user?.image || ""} alt="User" />
                    <AvatarFallback className="bg-slate-800 text-slate-400">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-slate-800 bg-slate-950 text-slate-50"
              >
                <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-slate-400">
                  {user?.email || "user@example.com"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="hover:bg-slate-900 focus:bg-slate-900">
                  <Link
                    href="/platform/profile"
                    className="flex w-full items-center"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  className="text-red-500 hover:bg-slate-900 focus:bg-slate-900"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
