"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin/api";
import { useAdminSession } from "@/lib/admin/session";
import type { AccountUser } from "@/lib/admin/types";
import { RequirePermission } from "@/components/admin/AdminShell";
import {
  CenteredSpinner, EmptyState, ErrorNote, formatDate, ghostButtonClass, dangerButtonClass, buttonClass,
  inputClass, PageHeader, Panel, Pill, RolePill, useDebounced,
} from "@/components/admin/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function UsersTable() {
  const { can, user: me } = useAdminSession();
  const queryClient = useQueryClient();
  const initialRole = useSearchParams().get("role") ?? "";
  const [role, setRole] = useState(initialRole);
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search);
  const [target, setTarget] = useState<AccountUser | null>(null);

  const users = useQuery({ queryKey: ["admin", "users", { role, search: debounced }], queryFn: () => adminApi.users({ role, search: debounced }) });

  const toggle = useMutation({
    mutationFn: (u: AccountUser) => adminApi.setUserActive(u.id, !u.is_active),
    onSuccess: (updated) => {
      toast.success(`${updated.email} ${updated.is_active ? "reactivated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setTarget(null);
    },
    onError: (e: Error) => { toast.error(e.message); setTarget(null); },
  });

  const roles = [
    ...(can("manage_users") ? [{ id: "buyer", label: "Buyers" }] : []),
    ...(can("manage_sellers") ? [{ id: "seller", label: "Sellers" }] : []),
  ];
  const rows = (users.data ?? []).filter((u) => u.role !== "admin");

  return (
    <>
      <PageHeader title="Buyers & Sellers" description="View accounts and deactivate or reactivate them. Every change is recorded in the audit log." />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <input className={`${inputClass} pl-9`} placeholder="Search by email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role">
            <option value="">All</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {users.isLoading ? <CenteredSpinner /> : users.isError ? <div className="p-4"><ErrorNote error={users.error} /></div> : !rows.length ? (
          <EmptyState title="No accounts found" hint="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3"><p className="font-medium">{u.email}</p><p className="text-xs text-muted-foreground">{u.phone_number || "No phone"}</p></td>
                    <td className="px-4 py-3"><RolePill role={u.role} /></td>
                    <td className="px-4 py-3">{u.store?.store_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.date_joined)}</td>
                    <td className="px-4 py-3">{u.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="red">Inactive</Pill>}</td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== me?.id && (
                        <button className={`${ghostButtonClass} h-8 px-3`} onClick={() => setTarget(u)}>{u.is_active ? "Deactivate" : "Reactivate"}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{target?.is_active ? "Deactivate" : "Reactivate"} {target?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.is_active
                ? "They will be signed out within minutes and will not be able to log in until reactivated."
                : "They will be able to log in again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={ghostButtonClass}>Cancel</AlertDialogCancel>
            <AlertDialogAction className={target?.is_active ? dangerButtonClass : buttonClass} disabled={toggle.isPending} onClick={() => target && toggle.mutate(target)}>
              {target?.is_active ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <RequirePermission any={["manage_users", "manage_sellers"]}>
      <Suspense fallback={<CenteredSpinner />}><UsersTable /></Suspense>
    </RequirePermission>
  );
}
