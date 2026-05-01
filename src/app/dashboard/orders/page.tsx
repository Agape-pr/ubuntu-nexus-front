"use client";

import { useSellerOrders, useUpdateOrderStatus } from "@/lib/api/hooks/useOrders";
import {
  Package, Truck, CheckCircle2, AlertCircle,
  ChevronDown, Sparkles, PackageCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { markOrdersAsSeen, getLastSeenOrderId } from "@/components/MobileNav";

const STATUS_CONFIG: Record<string, {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  stepIndex: number;
}> = {
  pending: {
    label: "New Order",
    badgeClass: "text-orange-600 bg-orange-100 border border-orange-200",
    icon: <Sparkles size={12} className="mr-1" />,
    stepIndex: 0,
  },
  shipped: {
    label: "Ready to Ship",
    badgeClass: "text-purple-600 bg-purple-100 border border-purple-200",
    icon: <Truck size={12} className="mr-1" />,
    stepIndex: 1,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    badgeClass: "text-teal-600 bg-teal-100 border border-teal-200",
    icon: <PackageCheck size={12} className="mr-1" />,
    stepIndex: 2,
  },
  completed: {
    label: "Completed",
    badgeClass: "text-emerald-600 bg-emerald-100 border border-emerald-200",
    icon: <CheckCircle2 size={12} className="mr-1" />,
    stepIndex: 3,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "text-rose-600 bg-rose-100 border border-rose-200",
    icon: <AlertCircle size={12} className="mr-1" />,
    stepIndex: -1,
  },
};

const STEPS = ["New Order", "Ready to Ship", "Ready for Pickup", "Completed"];

export default function SellerOrdersPage() {
  const { data: orders, isLoading, isError } = useSellerOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  // The max order ID seen BEFORE this visit — used to highlight new cards
  const [prevLastSeenId, setPrevLastSeenId] = useState<number>(0);

  useEffect(() => {
    if (!orders) return;
    // 1. Capture what the seller had seen BEFORE opening this page
    setPrevLastSeenId(getLastSeenOrderId());
    // 2. Now mark ALL current orders as seen (clears the badge)
    markOrdersAsSeen(orders);
  }, [orders]);

  const handleUpdateStatus = (e: React.MouseEvent, id: number, newStatus: string) => {
    e.stopPropagation();
    updateStatus({ id, status: newStatus });
  };

  const toggleExpand = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
        <div className="w-10 h-10 border-[3px] border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading your orders…</p>
      </div>
    );
  }

  // --- Error ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-xs mx-auto">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-rose-400" />
        </div>
        <h2 className="text-lg font-bold mb-1">Couldn't load orders</h2>
        <p className="text-muted-foreground text-sm">Please check your connection and try again.</p>
      </div>
    );
  }

  // --- Empty ---
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl flex items-center justify-center mb-6 border border-orange-100">
          <Package size={36} className="text-orange-300" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          When customers purchase your products, their orders will appear here.
        </p>
      </div>
    );
  }

  // A card is "new" if its ID is higher than what the seller had seen before this visit
  // AND the status is pending (hasn't been actioned yet)
  const isOrderNew = (order: any) =>
    order.id > prevLastSeenId && order.status === "pending";

  const newCount = orders.filter(isOrderNew).length;
  const shippingCount = orders.filter((o) => o.status === "shipped").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Sales Activity</p>
          <h1 className="text-2xl font-bold text-foreground">Order Notifications</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
            newCount > 0
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-secondary text-muted-foreground border-border"
          }`}>
            {newCount} New
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 border border-purple-100 text-purple-600">
            {shippingCount} Shipping
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-600">
            {completedCount} Done
          </span>
        </div>
      </div>

      {/* Order Cards */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const isNew = isOrderNew(order);
          const config = STATUS_CONFIG[order.status] ?? {
            label: order.status,
            badgeClass: "text-muted-foreground bg-secondary border-border",
            icon: <Package size={12} className="mr-1" />,
            stepIndex: 0,
          };
          const stepIndex = config.stepIndex;

          return (
            <div
              key={order.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                isNew
                  ? // ── NEW ORDER: strong amber/orange glow ──
                    "border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.4),0_6px_24px_rgba(251,146,60,0.18)] bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-card dark:from-amber-950/40 dark:via-orange-950/20 dark:to-card"
                  : isExpanded
                  ? "border-primary/20 bg-card shadow-md"
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm"
              }`}
            >
              {/* Thick top accent stripe for new orders */}
              {isNew && <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />}

              {/* Card Header */}
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer select-none"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isNew ? "bg-amber-100 dark:bg-amber-900/40" : "bg-secondary"
                  }`}>
                    {isNew
                      ? <Sparkles size={18} className="text-amber-500" />
                      : <Package size={18} className="text-muted-foreground" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">Order #{order.id}</span>
                      {isNew && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          ✦ NEW
                        </span>
                      )}
                      <span className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(order.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-shrink-0">
                  <div className="sm:text-right">
                    <p className={`font-black text-base leading-none ${isNew ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
                      {new Intl.NumberFormat("en-RW").format(parseFloat(order.total_amount))}
                      <span className="text-xs font-bold text-muted-foreground ml-1">RWF</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isNew ? "text-amber-500" : "text-muted-foreground"}`}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className={`border-t p-4 sm:p-5 space-y-5 ${isNew ? "border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/20" : "border-border/40 bg-background/50"}`}>

                    {/* Progress tracker */}
                    {order.status !== "cancelled" && (
                      <div className="flex items-start">
                        {STEPS.map((step, i) => {
                          const isDone = stepIndex > i;
                          const isCurrent = stepIndex === i;
                          return (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isCurrent
                                    ? "bg-amber-400 border-amber-400 text-white"
                                    : "bg-background border-border text-muted-foreground"
                                }`}>
                                  {isDone ? <CheckCircle2 size={13} /> : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold mt-1 text-center max-w-[48px] leading-tight ${
                                  isCurrent ? "text-amber-500" : isDone ? "text-emerald-600" : "text-muted-foreground"
                                }`}>
                                  {step}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 mb-5 ${stepIndex > i ? "bg-emerald-400" : "bg-border"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Items Ordered</h4>
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-card border border-border/40 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                                <Package size={14} className="text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-sm">
                              {new Intl.NumberFormat("en-RW").format(parseFloat(item.price) * item.quantity)} RWF
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment + Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Payment</p>
                        <p className={`text-sm font-bold mt-0.5 ${
                          order.payment_status === "held"
                            ? "text-amber-500"
                            : order.payment_status === "released"
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                        }`}>
                          {order.payment_status === "held"
                            ? "🔒 Held in Escrow"
                            : order.payment_status === "released"
                            ? "✅ Released to Seller"
                            : order.payment_status}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, "shipped")}
                            className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4"
                          >
                            <Truck size={13} /> Ready to Ship
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, "ready_for_pickup")}
                            className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4"
                          >
                            <PackageCheck size={13} /> Ready for Pickup
                          </Button>
                        )}
                        {order.status === "ready_for_pickup" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, "completed")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4"
                          >
                            <CheckCircle2 size={13} /> Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
