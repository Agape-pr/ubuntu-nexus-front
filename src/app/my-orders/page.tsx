"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { useBuyerOrders, useConfirmReceipt } from "@/lib/api/hooks/useOrders";
import { Package, ChevronDown, CheckCircle, Clock, Truck, ShoppingBag } from "lucide-react";
import { useState } from "react";

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; step: number }> = {
  pending:          { label: "New Order",          color: "bg-white/10 text-white/70 border border-white/15",          step: 1 },
  confirmed:        { label: "New Order",          color: "bg-white/10 text-white/70 border border-white/15",          step: 1 },
  shipped:          { label: "Ready to Ship",      color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", step: 2 },
  ready_to_ship:    { label: "Ready to Ship",      color: "bg-gold-bright/20 text-gold-accent border border-gold-bright/30", step: 2 },
  picked:           { label: "On its Way",         color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    step: 3 },
  out_for_delivery: { label: "On its Way",         color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    step: 3 },
  ready_for_pickup: { label: "On its Way",         color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    step: 3 },
  in_transit:       { label: "On its Way",         color: "bg-blue-500/20 text-blue-300 border border-blue-500/30",    step: 3 },
  completed:        { label: "Delivered",          color: "bg-success/20 text-success border border-success/30",       step: 4 },
};

function getStatus(status: string) {
  return ORDER_STATUS_MAP[status]
    || ORDER_STATUS_MAP[status?.toLowerCase()]
    || ORDER_STATUS_MAP.pending;
}

const STEPS = [
  { n: 1, label: "Placed",    icon: Package },
  { n: 2, label: "Confirmed", icon: Truck },
  { n: 3, label: "On its Way",icon: Truck },
  { n: 4, label: "Delivered", icon: CheckCircle },
];

function BuyerOrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const s = getStatus(order.status);
  const confirmMutation = useConfirmReceipt();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-white/5 transition-colors"
      >
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <ShoppingBag size={17} className="text-white/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-bold text-white">Order #{order.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
          </div>
          <div className="text-xs text-white/40">
            {new Date(order.created_at).toLocaleDateString("en-RW", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="mt-1">
            <span className="font-black text-white">{parseFloat(order.total_amount).toLocaleString()} </span>
            <span className="text-xs text-white/40 font-bold">RWF</span>
            <span className="text-xs text-white/30 ml-2">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <ChevronDown size={17} className={`text-white/30 shrink-0 mt-2 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-5 border-t border-white/8">
          {/* Progress bar */}
          <div className="pt-4 flex items-start justify-between gap-1 relative">
            <div className="absolute top-8 left-4 right-4 h-px bg-white/10 z-0" />
            {STEPS.map(step => {
              const done    = s.step > step.n;
              const current = s.step === step.n;
              const future  = s.step < step.n;
              const Icon = step.icon;
              return (
                <div key={step.n} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all
                    ${done ? "bg-success border-success text-white" : current ? "bg-gold-bright border-gold-bright text-near-black" : "bg-white/5 border-white/15 text-white/20"}`}>
                    {done ? <CheckCircle size={13} /> : <Icon size={13} />}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight
                    ${current ? "text-gold-accent" : done ? "text-success" : "text-white/25"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Items</p>
            <div className="bg-white/5 rounded-xl divide-y divide-white/8">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3">
                  <div className="h-9 w-9 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Package size={13} className="text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{item.product_name}</div>
                    <div className="text-xs text-white/40">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-white shrink-0">
                    {parseFloat(item.total_price || item.price || "0").toLocaleString()} <span className="text-xs text-white/40">RWF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm receipt button */}
          {(order.status === "picked" || order.status === "out_for_delivery" || order.status === "ready_for_pickup") && (
            <button
              onClick={() => confirmMutation.mutate(order.id)}
              disabled={confirmMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-success/20 text-success border border-success/30 font-bold text-sm hover:bg-success/30 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={15} /> I received my order
            </button>
          )}

          {order.status === "completed" && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 text-success border border-success/20 text-sm font-bold">
              <CheckCircle size={15} /> Delivered · Thank you!
            </div>
          )}

          {/* Payment */}
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} />
            <span>
              {order.status === "completed" ? "Payment released to seller" : "Payment held in escrow until delivery"}
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
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Your account</p>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <p className="text-white/40 text-sm">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl py-16 flex flex-col items-center text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <ShoppingBag size={26} className="text-white/20" />
            </div>
            <h3 className="font-bold text-white/80 text-lg mb-2">No orders yet</h3>
            <p className="text-sm text-white/40">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <BuyerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-white/40">Loading...</p></div>}>
      <MyOrdersContent />
    </Suspense>
  );
}
