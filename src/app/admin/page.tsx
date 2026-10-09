"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Users, Wallet, Store } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import { formatDateTime, formatMoney, PageHeader, Panel, Spinner } from "@/components/admin/ui";

function Stat({ icon: Icon, label, value, href, loading }: { icon: typeof Users; label: string; value: React.ReactNode; href: string; loading?: boolean }) {
  return (
    <Link href={href} className="block">
      <Panel className="p-5 transition-shadow hover:shadow-md">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary"><Icon size={20} /></div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">{loading ? <Spinner /> : value}</p>
      </Panel>
    </Link>
  );
}

export default function AdminOverviewPage() {
  const { user, can } = useAdminSession();
  const seeUsers = can("manage_users") || can("manage_sellers");

  const users = useQuery({ queryKey: ["admin", "users", "all"], queryFn: () => adminApi.users({}), enabled: seeUsers });
  const orders = useQuery({ queryKey: ["admin", "orders", "count"], queryFn: () => adminApi.orders({ page: 1 }), enabled: can("view_orders") });
  const releasable = useQuery({ queryKey: ["admin", "payments", "releasable"], queryFn: adminApi.releasable, enabled: can("manage_payments") });
  const balance = useQuery({ queryKey: ["admin", "payments", "balance"], queryFn: adminApi.balance, enabled: can("manage_payments"), retry: false });
  const audit = useQuery({ queryKey: ["admin", "audit", "recent"], queryFn: () => adminApi.audit({ limit: 8 }), enabled: can("view_audit_log") });

  const count = (role: string) => users.data?.filter((u) => u.role === role).length ?? 0;

  return (
    <>
      <PageHeader title="Overview" description={`Signed in as ${user?.email}${user?.is_superuser ? " · Super admin" : ""}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {seeUsers && <Stat icon={Users} label="Buyers" value={count("buyer")} href="/admin/users" loading={users.isLoading} />}
        {seeUsers && <Stat icon={Store} label="Sellers" value={count("seller")} href="/admin/users?role=seller" loading={users.isLoading} />}
        {can("view_orders") && <Stat icon={ShoppingBag} label="Total orders" value={orders.data?.count ?? "—"} href="/admin/orders" loading={orders.isLoading} />}
        {can("manage_payments") && (
          <Stat icon={Wallet} label="Awaiting payout" value={releasable.data?.length ?? "—"} href="/admin/payments" loading={releasable.isLoading} />
        )}
      </div>

      {can("manage_payments") && (
        <Panel className="mt-4 flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">IntouchPay account balance</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {balance.isLoading ? <Spinner /> : balance.isError ? "Unavailable" : formatMoney(balance.data?.balance)}
            </p>
          </div>
          <Link href="/admin/payments" className="text-sm font-semibold text-primary hover:underline">Manage payouts →</Link>
        </Panel>
      )}

      {can("view_audit_log") && (
        <Panel className="mt-6">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent activity</h2>
            <Link href="/admin/audit" className="text-sm font-semibold text-primary hover:underline">View all →</Link>
          </div>
          {audit.isLoading ? <div className="p-6"><Spinner /></div> : (
            <ul className="divide-y divide-border">
              {(audit.data?.results ?? []).map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span><span className="font-mono text-xs font-semibold">{e.action}</span> <span className="text-muted-foreground">by {e.actor_email || "system"}</span></span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(e.created_at)}</span>
                </li>
              ))}
              {!audit.data?.results.length && <li className="px-5 py-6 text-sm text-muted-foreground">No activity recorded yet.</li>}
            </ul>
          )}
        </Panel>
      )}
    </>
  );
}
