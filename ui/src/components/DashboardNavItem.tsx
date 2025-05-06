"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardNavItem = ({ name, href, icon }) => {
  const pathname = usePathname();

  const isActive = pathname === href;
  return (
    <Link
      key={name}
      href={href}
      className={`flex items-center space-x-3 rounded-md px-3 py-2 text-sm ${
        isActive
          ? "bg-blue-600/20 text-blue-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span>{name}</span>
    </Link>
  );
};

export const DashboardNavDivider = () => {
  return <div className="h-px bg-slate-800" />;
};

export default DashboardNavItem;
