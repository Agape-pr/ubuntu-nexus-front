"use client";

import { useSellerOrders, useUpdateOrderStatus } from "@/lib/api/hooks/useOrders";
import {
  Package, ShoppingBag, Truck, CheckCircle2, AlertCircle,
  ChevronDown, Sparkles, Clock, ArrowRight, PackageCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Key used in localStorage to track which order IDs have been "seen"
const SEEN_ORDERS_KEY = "seen_order_ids";

const getSeenOrderIds = (): number[] => {
  try {
    const raw = localStorage.getItem(SEEN_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markOrdersAsSeen = (ids: number[]) => {
  try {
    const existing = getSeenOrderIds();
    const merged = Array.from(new Set([...existing, ...ids]));
    localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(merged));
  } catch {}
};

// Status display config
const STATUS_CONFIG: Record<string, {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
  stepIndex: number;
}> = {
  pending: {
    label: "New Order",
    badgeClass: "text-orange-600 bg-orange-50 border border-orange-200",
    icon: <Sparkles size={12} className="mr-1" />,
    stepIndex: 0,
  },
  shipped: {
    label: "Ready to Ship",
    badgeClass: "text-purple-600 bg-purple-50 border border-purple-200",
    icon: <Truck size={12} className="mr-1" />,
    stepIndex: 1,
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    badgeClass: "text-teal-600 bg-teal-50 border border-teal-200",
    icon: <PackageCheck size={12} className="mr-1" />,
    stepIndex: 2,
  },
  completed: {
    label: "Completed",
    badgeClass: "text-emerald-600 bg-emerald-50 border border-emerald-200",
    icon: <CheckCircle2 size={12} className="mr-1" />,
    stepIndex: 3,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "text-rose-600 bg-rose-50 border border-rose-200",
    icon: <AlertCircle size={12} className="mr-1" />,
    stepIndex: -1,
  },
};

const STEPS = ["New Order", "Ready to Ship", "Ready for Pickup", "Completed"];

export default function SellerOrdersPage() {
  const { data: orders, isLoading, isError } = useSellerOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [seenIds, setSeenIds] = useState<number[]>([]);

  // On mount, read seen IDs and then mark all current orders as seen
  useEffect(() => {
    const currentSeen = getSeenOrderIds();
    setSeenIds(currentSeen);

    if (orders && orders.length > 0) {
      const allIds = orders.map((o) => o.id);
      markOrdersAsSeen(allIds);
      // Update local state so badge clears on next render
      setSeenIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  }, [orders]);

  const handleUpdateStatus = (e: React.MouseEvent, id: number, newStatus: string) => {
    e.stopPropagation();
    updateStatus({ id, status: newStatus });
  };

  const toggleExpand = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
        <div className="w-10 h-10 border-[3px] border-orange-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading your orders…</p>
      </div>
    );
  }

  // --- Error State ---
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

  // --- Empty State ---
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-sm mx-auto">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
          <ShoppingBag size={36} className="text-orange-300" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No orders yet</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          When customers purchase your products, their orders will appear here. Share your store link to attract buyers!
        </p>
      </div>
    );
  }

  const newOrdersCount = orders.filter(o => !seenIds.includes(o.id) && o.status === 'pending').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippingCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Sales Activity</p>
          <h1 className="text-2xl font-bold text-foreground">Order Notifications</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-xs font-bold text-orange-600">
            {pendingCount} New
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-xs font-bold text-purple-600">
            {shippingCount} Shipping
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600">
            {completedCount} Done
          </div>
        </div>
      </div>

      {/* ── Order Cards ── */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const isNew = !seenIds.includes(order.id) && order.status === 'pending';
          const config = STATUS_CONFIG[order.status] ?? {
            label: order.status,
            badgeClass: "text-muted-foreground bg-secondary border-border",
            icon: <Clock size={12} className="mr-1" />,
            stepIndex: 0,
          };
          const stepIndex = config.stepIndex;

          return (
            <div
              key={order.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                isNew
                  ? "border-orange-200 bg-orange-50/40 shadow-[0_0_0_1px_rgba(251,146,60,0.15)]"
                  : isExpanded
                  ? "border-primary/20 bg-card shadow-md"
                  : "border-border/50 bg-card hover:border-border hover:shadow-sm"
              }`}
            >
              {/* ── Card Header ── */}
              <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isNew ? "bg-orange-100" : "bg-secondary"
                  }`}>
                    {isNew
                      ? <Sparkles size={18} className="text-orange-500" />
                      : <Package size={18} className="text-muted-foreground" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">Order #{order.id}</span>
                      {isNew && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          NEW
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

                {/* Right: Amount + Chevron */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-shrink-0">
                  <div className="sm:text-right">
                    <p className="font-black text-foreground text-base leading-none">
                      {new Intl.NumberFormat('en-RW').format(parseFloat(order.total_amount))}
                      <span className="text-xs font-bold text-muted-foreground ml-1">RWF</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* ── Expanded Details ── */}
              <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <div className="border-t border-border/40 bg-background/50 p-4 sm:p-5 space-y-5">

                    {/* Progress Steps */}
                    {order.status !== 'cancelled' && (
                      <div className="flex items-center gap-0">
                        {STEPS.map((step, i) => {
                          const isCompleted = stepIndex > i;
                          const isCurrent = stepIndex === i;
                          return (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                                  isCompleted
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : isCurrent
                                    ? "bg-orange-400 border-orange-400 text-white"
                                    : "bg-background border-border text-muted-foreground"
                                }`}>
                                  {isCompleted ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span className={`text-[9px] font-bold mt-1 text-center whitespace-nowrap ${
                                  isCurrent ? "text-orange-500" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                                }`}>
                                  {step}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${
                                  stepIndex > i ? "bg-emerald-400" : "bg-border"
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Items List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Items Ordered</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-card border border-border/40 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                                <Package size={14} className="text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm leading-tight">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-sm text-foreground">
                              {new Intl.NumberFormat('en-RW').format(parseFloat(item.price) * item.quantity)} RWF
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Payment + Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Payment</p>
                        <p className={`text-sm font-bold mt-0.5 ${
                          order.payment_status === 'held' ? 'text-amber-500' :
                          order.payment_status === 'released' ? 'text-emerald-500' :
                          'text-muted-foreground'
                        }`}>
                          {order.payment_status === 'held' ? '🔒 Held in Escrow' :
                           order.payment_status === 'released' ? '✅ Released to Seller' :
                           order.payment_status}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, 'shipped')}
                            className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4 shadow-sm"
                          >
                            <Truck size={13} />
                            Ready to Ship
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, 'ready_for_pickup')}
                            className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4 shadow-sm"
                          >
                            <PackageCheck size={13} />
                            Ready for Pickup
                          </Button>
                        )}
                        {order.status === 'ready_for_pickup' && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={(e) => handleUpdateStatus(e, order.id, 'completed')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-1.5 text-xs h-9 px-4 shadow-sm"
                          >
                            <CheckCircle2 size={13} />
                            Mark Complete
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
