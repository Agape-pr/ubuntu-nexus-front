"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, ShoppingBag, Wallet, ScrollText, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useAdminSession } from "@/lib/admin/session";
import type { AdminPermission } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
  visible: (can: (p: AdminPermission) => boolean, superuser: boolean) => boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, visible: () => true },
  { href: "/admin/users", label: "Buyers & Sellers", icon: Users, visible: (can) => can("manage_users") || can("manage_sellers") },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, visible: (can) => can("view_orders") },
  { href: "/admin/payments", label: "Payments", icon: Wallet, visible: (can) => can("manage_payments") },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText, visible: (can) => can("view_audit_log") },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck, visible: (_can, superuser) => superuser },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, can, logout } = useAdminSession();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((i) => i.visible(can, !!user?.is_superuser));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      {/* desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display text-lg font-black text-primary">UbuntuNow</p>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin console</p>
        </div>
        {nav}
        <div className="border-t border-border p-3">
          <p className="truncate px-3 text-sm font-medium">{user?.email}</p>
          <p className="px-3 pb-2 text-xs text-muted-foreground">{user?.is_superuser ? "Super admin" : "Admin"}</p>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* mobile top bar + drawer */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <p className="font-display text-lg font-black text-primary">UbuntuNow <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin</span></p>
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-muted"><Menu size={20} /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="font-display text-lg font-black text-primary">UbuntuNow</p>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X size={18} /></button>
            </div>
            {nav}
            <div className="border-t border-border p-3">
              <p className="truncate px-3 pb-2 text-sm font-medium">{user?.email}</p>
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                <LogOut size={18} /> Sign out
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}

/** Renders children only when the signed-in admin holds one of the permissions. */
export function RequirePermission({ any, superOnly, children }: { any?: AdminPermission[]; superOnly?: boolean; children: React.ReactNode }) {
  const { can, user } = useAdminSession();
  const allowed = superOnly ? !!user?.is_superuser : (any ?? []).some(can);
  if (!allowed) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-lg font-semibold">You don&apos;t have access to this section.</p>
        <p className="mt-1 text-sm text-muted-foreground">Ask a super admin to grant you the permission.</p>
      </div>
    );
  }
  return <>{children}</>;
}
