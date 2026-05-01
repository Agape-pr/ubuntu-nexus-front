"use client";

import { useSellerOrders, useUpdateOrderStatus } from "@/lib/api/hooks/useOrders";
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SellerOrdersPage() {
  const { data: orders, isLoading, isError } = useSellerOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <AlertCircle size={48} className="text-rose-500 mb-4 opacity-80" />
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">We couldn't load your orders. Please check your connection and try again.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto bg-card rounded-3xl border border-border/50 p-8 shadow-sm">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Package size={32} className="text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">No order notification yet</h2>
        <p className="text-muted-foreground text-sm">
          When customers purchase your products, their orders will appear here. Keep sharing your store link to attract more buyers!
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'PROCESSING': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'SHIPPED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'READY_FOR_PICKUP': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'COMPLETED': return 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20';
      case 'CANCELLED': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return <Clock size={14} className="mr-1.5" />;
      case 'SHIPPED': return <Truck size={14} className="mr-1.5" />;
      case 'COMPLETED': return <CheckCircle2 size={14} className="mr-1.5" />;
      default: return <Package size={14} className="mr-1.5" />;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    updateStatus({ id, status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Orders Overview</h1>
          <p className="text-muted-foreground mt-1">Manage and track your recent sales.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-card border border-border px-4 py-2 rounded-xl shadow-sm">
            <span className="text-sm text-muted-foreground mr-2">Total Orders:</span>
            <span className="font-bold text-foreground">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          
          return (
            <div 
              key={order.id} 
              className={`bg-card border ${isExpanded ? 'border-primary/30 shadow-md' : 'border-border/60 hover:border-border'} rounded-2xl overflow-hidden transition-all duration-200`}
            >
              {/* Order Header - Clickable for expansion */}
              <div 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Package size={20} className="text-foreground/70" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-foreground">Order #{order.id}</h3>
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border flex items-center ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Amount</p>
                    <p className="font-bold text-lg text-foreground">
                      {new Intl.NumberFormat('en-RW').format(parseFloat(order.total_amount))} RWF
                    </p>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>

              {/* Order Details - Expandable */}
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-5 border-t border-border/50 bg-secondary/20">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Order Items</h4>
                    <div className="space-y-3 mb-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-card border border-border/50 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                              <ShoppingBag size={16} className="text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm">
                            {new Intl.NumberFormat('en-RW').format(parseFloat(item.price) * item.quantity)} RWF
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Payment Status</p>
                        <p className={`text-sm font-bold mt-1 ${order.payment_status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {order.payment_status}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                            disabled={isUpdating}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'shipped'); }}
                          >
                            Mark Shipped
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                            disabled={isUpdating}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'completed'); }}
                          >
                            Mark Completed
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

// Temporary icon since we didn't import it at the top
const ShoppingBag = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
