"use client";

import Link from "next/link";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import {
  Trash2, ShoppingBag, ArrowRight, Plus, Minus,
  ShieldCheck, Zap, Package, ChevronLeft, ImageOff, X,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api/config";
import { toast } from "sonner";
import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";

function CartContent() {
  const { items, removeItem, getTotalPrice, updateQuantity, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentIframeUrl, setPaymentIframeUrl] = useState<string | null>(null);
  const router = useRouter();
  const { data: userProfile } = useCurrentUser();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace(/[\s\n\r\t\u200B"']/g, '') : null;
      if (!token) {
        toast.error("Please log in to proceed with checkout.");
        router.push("/auth");
        return;
      }
      if (!userProfile?.address_line1) {
        toast.error("Please add a delivery address to checkout.", {
          action: { label: "Add Address", onClick: () => router.push("/profile") },
        });
        router.push("/profile");
        return;
      }
      const orderPayload = {
        delivery_address: {
          address_line1: userProfile.address_line1,
          address_line2: userProfile.address_line2,
          city: userProfile.city,
          country: userProfile.country,
        },
        items: items.map((item) => {
          const realId = item.productId || item.id.toString().split("-")[0];
          return {
            product_id: parseInt(realId, 10),
            quantity: item.quantity,
            selected_variations: item.selected_variations || {},
          };
        }),
      };
      const orderRes = await fetch(`${API_BASE_URL}/orders/checkout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      });
      
      const isOrderJson = orderRes.headers.get("content-type")?.includes("application/json");
      if (!orderRes.ok) {
        if (isOrderJson) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || "Failed to create order");
        } else {
          throw new Error(`Order failed (Server returned ${orderRes.status}). The backend may be offline or outdated.`);
        }
      }
      
      const orders = isOrderJson ? await orderRes.json() : [];
      if (orders && orders.length > 0) {
        const orderId = orders[0].id;
        // 2. Initiate Real Payment with Pesapal
        const paymentPayload = {
          order_id: orderId,
          payment_method: 'pesapal'
        };
        
        const paymentRes = await fetch(`${API_BASE_URL}/payments/payment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentPayload)
        });
        
        const isPaymentJson = paymentRes.headers.get("content-type")?.includes("application/json");
        if (!paymentRes.ok) {
           if (isPaymentJson) {
             const errData = await paymentRes.json();
             throw new Error(errData.error || 'Failed to initiate payment');
           } else {
             throw new Error(`Payment endpoint not found (Server returned ${paymentRes.status}). Railway backend needs to be deployed first!`);
           }
        }
        
        const paymentData = await paymentRes.json();
        
        // 3. Open Pesapal iframe in a popup
        if (paymentData.redirect_url) {
           setPaymentIframeUrl(paymentData.redirect_url);
        } else {
           throw new Error("No redirect URL returned from payment gateway");
        }
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Failed to complete checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Listen for messages from the iframe (when callback page loads)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PESAPAL_PAYMENT_COMPLETE") {
        setPaymentIframeUrl(null);
        clearCart();
        toast.success('Payment completed successfully!');
        router.push('/dashboard'); // or wherever you want them to go
      } else if (event.data?.type === "PESAPAL_PAYMENT_CANCELLED") {
        setPaymentIframeUrl(null);
        toast.error('Payment was cancelled.');
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [clearCart, router]);

  return (
    <BuyerDashboardShell>
      <div className="flex flex-col bg-background min-h-full">

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="h-20 w-20 rounded-3xl bg-white/5 border border-white/8 flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-muted-foreground/60" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Discover products from local sellers across Rwanda.
            </p>
            <Button asChild className="bg-gold-bright hover:bg-gold-accent text-near-black font-bold rounded-xl px-6 border-0">
              <Link href="/dashboard?view=shop">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          /* ── Desktop two-panel layout ── */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

            {/* ════ LEFT PANEL — scrollable item list ════ */}
            <div className="flex-1 min-w-0 lg:overflow-y-auto">
              <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 lg:py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-baseline gap-2.5">
                    <h1 className="font-display text-xl font-black text-foreground tracking-tight">Cart</h1>
                    <span className="text-sm text-muted-foreground/80 tabular-nums">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <button
                    onClick={() => clearCart()}
                    className="text-xs text-muted-foreground/60 hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Item list */}
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="group flex gap-4 p-4 bg-card rounded-2xl border border-white/6 hover:border-white/10 transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden bg-white/5 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageOff size={18} className="opacity-25" strokeWidth={1.5} /></div>
                        )}
                        {item.in_stock === true && (
                          <span className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 text-[9px] font-bold bg-gold-bright/90 text-white py-0.5">
                            <Zap size={9} className="fill-current" /> Quick
                          </span>
                        )}
                        {item.in_stock === false && (
                          <span className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 text-[9px] font-bold bg-black/70 text-gold-accent py-0.5">
                            <Package size={9} /> Same day
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                            {item.storeName && (
                              <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{item.storeName}</p>
                            )}
                            {item.selected_variations &&
                              Object.keys(item.selected_variations).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {Object.entries(item.selected_variations).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/8 px-1.5 py-0.5 rounded-md"
                                    >
                                      <span className="text-muted-foreground/60">{k}:</span> {v as string}
                                    </span>
                                  ))}
                                </div>
                              )}
                          </div>
                          <button
                            aria-label="Remove item"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 p-1.5 text-muted-foreground/45 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Price + stepper */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-muted-foreground/80">RWF</span>
                            <span className="font-display text-[15px] font-black text-gold-accent leading-none tracking-tight">
                              {new Intl.NumberFormat("en-RW").format(item.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-muted-foreground/60">
                                ({new Intl.NumberFormat("en-RW").format(item.price)} ea)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center h-8 rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                            <button
                              aria-label="Decrease"
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(item.id, item.quantity - 1)
                                  : removeItem(item.id)
                              }
                              className="w-8 h-full flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-white/8 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-foreground select-none tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-full flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-white/8 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Back to shopping — desktop only */}
                <div className="mt-6 hidden lg:block">
                  <Link
                    href="/dashboard?view=shop"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
                  >
                    <ChevronLeft size={14} /> Continue shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* ════ RIGHT PANEL — sticky order summary ════ */}
            <div className="
              w-full lg:w-[380px] xl:w-[420px] shrink-0
              lg:border-l border-t lg:border-t-0 border-white/6
              bg-background
              lg:sticky lg:top-0 lg:h-[calc(100vh-64px)] lg:overflow-y-auto
            ">
              <div className="px-6 py-8 lg:py-10 flex flex-col h-full">

                <h2 className="text-base font-bold text-foreground mb-6">Order Summary</h2>

                {/* Line items breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="text-foreground font-medium tabular-nums">
                      {new Intl.NumberFormat("en-RW").format(totalPrice)} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-emerald-400 font-semibold">Free</span>
                  </div>
                  <div className="h-px bg-white/6" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-sm font-bold text-foreground">Total</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-muted-foreground">RWF</span>
                      <span className="font-display text-2xl font-black text-gold-accent tracking-tight tabular-nums">
                        {new Intl.NumberFormat("en-RW").format(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-store mini list */}
                <div className="mb-6 space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-muted-foreground/60">
                      <span className="truncate max-w-[60%]">{item.quantity}× {item.name}</span>
                      <span className="tabular-nums shrink-0">
                        {new Intl.NumberFormat("en-RW").format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Spacer on desktop so CTA stays at bottom */}
                <div className="flex-1 hidden lg:block" />

                {/* CTA */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="
                      w-full h-12 rounded-xl font-bold text-sm
                      bg-gold-bright hover:bg-gold-accent text-near-black
                      flex items-center justify-center gap-2
                      transition-all duration-200
                      hover:shadow-[0_0_28px_rgba(240,184,0,0.28)]
                      active:scale-[0.98]
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                    "
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-near-black/30 border-t-near-black animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      <>Proceed to Checkout <ArrowRight size={15} strokeWidth={2.5} /></>
                    )}
                  </button>

                  <Link
                    href="/dashboard?view=shop"
                    className="block lg:hidden w-full h-10 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/16 hover:bg-white/4 transition-all duration-200 flex items-center justify-center"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-5 space-y-2.5 pt-5 border-t border-white/6">
                  <TrustRow icon={ShieldCheck} color="text-emerald-400" label="2-hour escrow — pay only when satisfied" />
                  <TrustRow icon={Zap}         color="text-gold-accent"   label="Fast payouts to verified sellers" />
                  <TrustRow icon={Package}     color="text-sky-400"     label="Same-day delivery in Kigali" />
                </div>

                {/* Payment options */}
                <div className="mt-5 pt-5 border-t border-white/6">
                  <PaymentOptions />
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* Pesapal Payment Popup Modal */}
      {paymentIframeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl h-[90vh] flex flex-col relative shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800">Complete Your Payment</h2>
              <button 
                onClick={() => setPaymentIframeUrl(null)}
                className="inline-flex items-center gap-1 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            </div>
            <div className="flex-1 w-full relative bg-white">
              <iframe 
                src={paymentIframeUrl} 
                className="absolute inset-0 w-full h-full border-0"
                allow="payment"
              />
            </div>
          </div>
        </div>
      )}
    </BuyerDashboardShell>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-white/40">Loading...</p></div>}>
      <CartContent />
    </Suspense>
  );
}

function TrustRow({
  icon: Icon,
  color,
  label,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={13} className={`${color} shrink-0`} />
      <span className="text-[11px] text-muted-foreground/80 leading-snug">{label}</span>
    </div>
  );
}