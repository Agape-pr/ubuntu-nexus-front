"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin/api";
import type { AdminPayment } from "@/lib/admin/types";
import { RequirePermission } from "@/components/admin/AdminShell";
import {
  buttonClass, CenteredSpinner, EmptyState, ErrorNote, formatDateTime, formatMoney, ghostButtonClass, inputClass,
  PageHeader, Pager, Panel, Spinner, StatusPill,
} from "@/components/admin/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 50;
const STATUSES = ["pending", "completed", "released", "failed", "refunded"];

function PaymentsManager() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState<AdminPayment | null>(null);

  const balance = useQuery({ queryKey: ["admin", "payments", "balance"], queryFn: adminApi.balance, retry: false });
  const releasable = useQuery({ queryKey: ["admin", "payments", "releasable"], queryFn: adminApi.releasable });
  const all = useQuery({
    queryKey: ["admin", "payments", "all", { status, offset }],
    queryFn: () => adminApi.payments({ limit: PAGE_SIZE, offset, status }),
    placeholderData: (prev) => prev,
  });

  const release = useMutation({
    mutationFn: (p: AdminPayment) => adminApi.releasePayment(p.id),
    onSuccess: (_r, p) => {
      toast.success(`Payout released for order #${p.order_id}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      setTarget(null);
    },
    onError: (e: Error) => { toast.error(e.message); setTarget(null); },
  });

  return (
    <>
      <PageHeader title="Payments & payouts" description="Buyer payments are held in escrow. Release a payout to the seller once the order is complete." />

      <Panel className="mb-6 p-5">
        <p className="text-sm text-muted-foreground">IntouchPay account balance</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {balance.isLoading ? <Spinner /> : balance.isError ? <span className="text-base font-medium text-destructive">Could not load balance</span> : formatMoney(balance.data?.balance)}
        </p>
      </Panel>

      <Panel className="mb-6">
        <div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Held in escrow — awaiting release</h2></div>
        {releasable.isLoading ? <CenteredSpinner /> : releasable.isError ? <div className="p-4"><ErrorNote error={releasable.error} /></div> : !releasable.data?.length ? (
          <EmptyState title="Nothing to release" hint="Paid orders appear here until you release the seller's payout." />
        ) : (
          <ul className="divide-y divide-border">
            {releasable.data.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium">Order #{p.order_id} · <span className="tabular-nums">{formatMoney(p.payment_amount)}</span></p>
                  <p className="text-xs text-muted-foreground">{p.payment_method} · paid {formatDateTime(p.payment_date)}</p>
                </div>
                <button className={buttonClass} onClick={() => setTarget(p)}>Release payout</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-semibold">All payments</h2>
          <select className={`${inputClass} w-auto`} value={status} onChange={(e) => { setStatus(e.target.value); setOffset(0); }} aria-label="Payment status">
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {all.isLoading ? <CenteredSpinner /> : all.isError ? <div className="p-4"><ErrorNote error={all.error} /></div> : !all.data?.results.length ? (
          <EmptyState title="No payments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Method</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reference</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {all.data.results.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-semibold">#{p.order_id}</td>
                    <td className="px-4 py-3">{p.payment_method}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(p.payment_amount)}</td>
                    <td className="px-4 py-3"><StatusPill value={p.payment_status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(p.payment_date)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.transaction_id ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager total={all.data?.count ?? 0} pageSize={PAGE_SIZE} offset={offset} onChange={setOffset} />
      </Panel>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && !release.isPending && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release {target && formatMoney(target.payment_amount)} to the seller?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends real money to the seller&apos;s mobile-money number for order #{target?.order_id}. It cannot be undone, and it is recorded in the audit log under your name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={ghostButtonClass} disabled={release.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonClass}
              disabled={release.isPending}
              onClick={(e) => { e.preventDefault(); if (target) release.mutate(target); }}
            >
              {release.isPending ? "Releasing…" : "Release payout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AdminPaymentsPage() {
  return <RequirePermission any={["manage_payments"]}><PaymentsManager /></RequirePermission>;
}
