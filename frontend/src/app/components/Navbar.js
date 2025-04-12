"use client";

import MainNavbar from "./MainNavbar";
import AdminNavbar from "./AdminNavbar";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const onAdminPanel = pathname.startsWith("/admin");

  // run admin check logic on /admin routes
  const { loading, isAdmin } = useAdminCheck(false);

  if (onAdminPanel) {
    if (loading) return null;
    if (!isAdmin) return null;
    return <AdminNavbar />;
  }

  // for all other routes, show the regular navbar
  return <MainNavbar />;
}
