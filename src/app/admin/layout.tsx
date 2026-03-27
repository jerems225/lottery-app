import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Role verification: MANAGER, ADMIN, or SUPERADMIN (Agents have their own dedicated tree)
  const allowedRoles = ["MANAGER", "ADMIN", "SUPERADMIN"];
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return (
    <AdminLayoutWrapper session={session}>
        {children}
    </AdminLayoutWrapper>
  );
}
