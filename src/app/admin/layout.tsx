"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSessionProvider, useAdminSession } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { CenteredSpinner } from "@/components/admin/ui";

function Guard({ children }: { children: React.ReactNode }) {
  const { status } = useAdminSession();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (status === "anonymous" && !onLogin) router.replace("/admin/login");
    if (status === "authenticated" && onLogin) router.replace("/admin");
  }, [status, onLogin, router]);

  if (status === "loading") return <div className="min-h-screen bg-background"><CenteredSpinner /></div>;
  if (onLogin) return <>{children}</>;
  if (status !== "authenticated") return <div className="min-h-screen bg-background"><CenteredSpinner /></div>;
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <Guard>{children}</Guard>
    </AdminSessionProvider>
  );
}
