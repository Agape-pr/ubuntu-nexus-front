"use client";

import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { RequirePermission } from "@/components/admin/AdminShell";
import {
  CenteredSpinner, EmptyState, ErrorNote, formatDateTime, formatMoney, inputClass, PageHeader, Pager, Panel, StatusPill, useDebounced,
} from "@/components/admin/ui";

const PAGE_SIZE = 50;
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "ready_for_pickup", "completed", "disputed", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "held", "released", "failed", "refunded"];

function OrdersTable() {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const debounced = useDebounced(search);

  const orders = useQuery({
    queryKey: ["admin", "orders", { status, paymentStatus, debounced, page }],
    queryFn: () => adminApi.orders({ page, status, payment_status: paymentStatus, search: debounced }),
    placeholderData: (prev) => prev,
  });
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  return (
    <>
      <PageHeader title="Orders" description="Every order on the marketplace (read-only)." />
      <Panel>
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
            <input className={`${inputClass} pl-9`} placeholder="Order number, e.g. 1042" value={search} onChange={(e) => reset(setSearch)(e.target.value)} />
          </div>
          <select className={`${inputClass} w-auto`} value={status} onChange={(e) => reset(setStatus)(e.target.value)} aria-label="Order status">
            <option value="">Any order status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <select className={`${inputClass} w-auto`} value={paymentStatus} onChange={(e) => reset(setPaymentStatus)(e.target.value)} aria-label="Payment status">
            <option value="">Any payment status</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {orders.isLoading ? <CenteredSpinner /> : orders.isError ? <div className="p-4"><ErrorNote error={orders.error} /></div> : !orders.data?.results.length ? (
          <EmptyState title="No orders match" hint="Adjust the filters above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Placed</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Store</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.data.results.map((o) => (
                  <Fragment key={o.id}>
                    <tr className="cursor-pointer hover:bg-muted/40" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                      <td className="px-4 py-3 font-semibold">#{o.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                      <td className="px-4 py-3">User {o.buyer_id}</td>
                      <td className="px-4 py-3">Store {o.store_id}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(o.total_amount)}</td>
                      <td className="px-4 py-3"><StatusPill value={o.status} /></td>
                      <td className="px-4 py-3"><StatusPill value={o.payment_status} /></td>
                    </tr>
                    {openId === o.id && (
                      <tr className="bg-muted/30">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Items</p>
                              <ul className="space-y-1 text-sm">
                                {o.items.map((i) => (
                                  <li key={i.id} className="flex justify-between gap-4"><span>{i.quantity} × {i.product_name}</span><span className="tabular-nums">{formatMoney(i.subtotal)}</span></li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery</p>
                              <p className="text-sm">{o.delivery_address ? Object.values(o.delivery_address).filter(Boolean).join(", ") : "No address recorded"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager total={orders.data?.count ?? 0} pageSize={PAGE_SIZE} offset={(page - 1) * PAGE_SIZE} onChange={(off) => setPage(off / PAGE_SIZE + 1)} />
      </Panel>
    </>
  );
}

export default function AdminOrdersPage() {
  return <RequirePermission any={["view_orders"]}><OrdersTable /></RequirePermission>;
}
