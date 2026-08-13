"use client";

import { Suspense } from "react";
import Link from "next/link";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { Button } from "@/components/ui/button";
import { useBuyerOrders, useConfirmReceipt } from "@/lib/api/hooks/useOrders";
import { Package, ChevronDown, CheckCircle, Clock, Truck, ShoppingBag } from "lucide-react";
import { useState } from "react";

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  pending:          { label: "Processing",      color: "bg-secondary text-foreground border-border", step: 1 },
  confirmed:        { label: "Confirmed",       color: "bg-secondary text-foreground border-border", step: 1 },
  shipped:          { label: "Ready to Ship",   color: "bg-amber-500/10 text-amber-600 border-amber-500/20", step: 2 },
  ready_to_ship:    { label: "Ready to Ship",   color: "bg-amber-500/10 text-amber-600 border-amber-500/20", step: 2 },
  picked:           { label: "In Transit",      color: "bg-blue-500/10 text-blue-600 border-blue-500/20", step: 3 },
  out_for_delivery: { label: "Out for Delivery", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", step: 3 },
  ready_for_pickup: { label: "Ready for Pickup",color: "bg-blue-500/10 text-blue-600 border-blue-500/20", step: 3 },
  in_transit:       { label: "In Transit",      color: "bg-blue-500/10 text-blue-600 border-blue-500/20", step: 3 },
  completed:        { label: "Delivered",       color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", step: 4 },
};

function getStatus(status: string) {
  return ORDER_STATUS_MAP[status]
    || ORDER_STATUS_MAP[status?.toLowerCase()]
    || ORDER_STATUS_MAP.pending;
}

const STEPS = [
  { n: 1, label: "Placed",    icon: Package },
  { n: 2, label: "Confirmed", icon: Truck },
  { n: 3, label: "In Transit",icon: Truck },
  { n: 4, label: "Delivered", icon: CheckCircle },
];

function BuyerOrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const s = getStatus(order.status);
  const confirmMutation = useConfirmReceipt();

  return (
    <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-secondary/40 transition-colors"
      >
        <div className="h-10 w-10 rounded-lg bg-secondary border border-border/80 flex items-center justify-center shrink-0 text-foreground">
          <ShoppingBag size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-foreground">Order #{order.id}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-bold text-foreground text-sm">
              {parseFloat(order.total_amount).toLocaleString()} RWF
            </span>
            <span className="text-xs text-muted-foreground">({order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"})</span>
          </div>
        </div>
        <ChevronDown size={17} className={`text-muted-foreground shrink-0 mt-2 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-border/80 pt-4">
          {/* Progress bar */}
          <div className="flex items-start justify-between gap-1 relative py-2">
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-border z-0" />
            {STEPS.map(step => {
              const done    = s.step > step.n;
              const current = s.step === step.n;
              const Icon = step.icon;
              return (
                <div key={step.n} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all
                    ${done ? "bg-emerald-600 border-emerald-600 text-white" : current ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}>
                    {done ? <CheckCircle size={14} /> : <Icon size={13} />}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight
                    ${current ? "text-foreground font-bold" : done ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Items</p>
            <div className="bg-secondary/30 rounded-lg border border-border/60 divide-y divide-border/60">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3.5 py-3">
                  <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                    <Package size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{item.product_name}</div>
                    <div className="text-[11px] text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-xs font-bold text-foreground shrink-0">
                    {parseFloat(item.total_price || item.price || "0").toLocaleString()} RWF
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm receipt button */}
          {(order.status === "picked" || order.status === "out_for_delivery" || order.status === "ready_for_pickup") && (
            <Button
              onClick={() => confirmMutation.mutate(order.id)}
              disabled={confirmMutation.isPending}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 rounded-lg"
            >
              <CheckCircle size={15} /> Confirm Order Received
            </Button>
          )}

          {order.status === "completed" && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle size={15} /> Delivery Confirmed · Escrow Released
            </div>
          )}

          {/* Escrow badge */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={13} />
            <span>
              {order.status === "completed" ? "Payment successfully released to seller." : "Payment securely held in escrow until delivery is confirmed."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function MyOrdersContent() {
  const { data: orders = [], isLoading } = useBuyerOrders();

  return (
    <BuyerDashboardShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Account History</p>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-card border border-border/80 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-xl py-14 flex flex-col items-center text-center px-6 shadow-2xs">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-3 text-muted-foreground">
              <ShoppingBag size={22} />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">No Orders Found</h3>
            <p className="text-xs text-muted-foreground mb-5 max-w-xs">You haven&apos;t placed any orders yet. Explore local items in the marketplace.</p>
            <Button asChild size="sm" className="rounded-lg font-semibold">
              <Link href="/dashboard?view=shop">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <BuyerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </BuyerDashboardShell>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-xs text-muted-foreground">Loading orders...</p></div>}>
      <MyOrdersContent />
    </Suspense>
  );
}

