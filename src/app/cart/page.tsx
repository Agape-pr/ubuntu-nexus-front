"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import {
  Trash2, ShoppingBag, ArrowRight, Plus, Minus,
  ShieldCheck, Zap, Package, ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api/config";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/api/hooks/useUsers";

export default function CartPage() {
  const { items, removeItem, getTotalPrice, updateQuantity, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { data: userProfile } = useCurrentUser();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
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
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to create order");
      }
      const orders = await orderRes.json();
      if (orders && orders.length > 0) {
        const orderId = orders[0].id;
        const paymentRes = await fetch(`${API_BASE_URL}/orders/${orderId}/mock-payment/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!paymentRes.ok) throw new Error("Payment simulation failed");
        clearCart();
        toast.success("Order placed! Payment held securely in escrow.", { duration: 5000 });
        router.push("/");
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Failed to complete checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0e0d]">
      <Navbar />

      <main className="flex-1 w-full">

        {/* ── Empty state ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="h-20 w-20 rounded-3xl bg-[#1A1A19] border border-white/8 flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-[#444340]" />
            </div>
            <h2 className="text-xl font-bold text-[#FBF8F2] mb-2">Your cart is empty</h2>
            <p className="text-[#666560] mb-8 max-w-xs">
              Discover products from local sellers across Rwanda.
            </p>
            <Link href="/marketplace">
              <Button className="bg-[#B87800] hover:bg-[#F0B800] text-[#111110] font-bold rounded-xl px-6 border-0">
                Browse Marketplace
              </Button>
            </Link>
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
                    <h1 className="text-xl font-black text-[#FBF8F2] tracking-tight">Cart</h1>
                    <span className="text-sm text-[#555450] tabular-nums">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <button
                    onClick={() => clearCart()}
                    className="text-xs text-[#444340] hover:text-rose-400 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Item list */}
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="group flex gap-4 p-4 bg-[#161615] rounded-2xl border border-white/6 hover:border-white/10 transition-all duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden bg-[#1A1A19] shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                        )}
                        {item.in_stock === true && (
                          <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold bg-[#B87800]/90 text-white py-0.5">
                            ⚡ Quick
                          </span>
                        )}
                        {item.in_stock === false && (
                          <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold bg-black/70 text-[#F0B800] py-0.5">
                            📦 Same day
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[#FBF8F2] text-sm leading-snug line-clamp-2">
                              {item.name}
                            </h3>
                            {item.storeName && (
                              <p className="text-[11px] text-[#555450] mt-0.5 truncate">{item.storeName}</p>
                            )}
                            {item.selected_variations &&
                              Object.keys(item.selected_variations).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {Object.entries(item.selected_variations).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-[10px] font-medium bg-white/5 text-[#888780] border border-white/8 px-1.5 py-0.5 rounded-md"
                                    >
                                      <span className="text-[#444340]">{k}:</span> {v as string}
                                    </span>
                                  ))}
                                </div>
                              )}
                          </div>
                          <button
                            aria-label="Remove item"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 p-1.5 text-[#333330] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Price + stepper */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-[#555450]">RWF</span>
                            <span
                              className="text-[15px] font-black text-[#F0B800] leading-none tracking-tight"
                              style={{ fontFamily: "Nunito, sans-serif" }}
                            >
                              {new Intl.NumberFormat("en-RW").format(item.price * item.quantity)}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-[#444340]">
                                ({new Intl.NumberFormat("en-RW").format(item.price)} ea)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center h-8 rounded-lg border border-white/10 bg-[#1A1A19] overflow-hidden">
                            <button
                              aria-label="Decrease"
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQuantity(item.id, item.quantity - 1)
                                  : removeItem(item.id)
                              }
                              className="w-8 h-full flex items-center justify-center text-[#555450] hover:text-[#FBF8F2] hover:bg-white/8 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#FBF8F2] select-none tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              aria-label="Increase"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-full flex items-center justify-center text-[#555450] hover:text-[#FBF8F2] hover:bg-white/8 transition-colors"
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
                    href="/marketplace"
                    className="inline-flex items-center gap-1.5 text-sm text-[#555450] hover:text-[#FBF8F2] transition-colors"
                  >
                    ← Continue shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* ════ RIGHT PANEL — sticky order summary ════ */}
            <div className="
              w-full lg:w-[380px] xl:w-[420px] shrink-0
              lg:border-l border-t lg:border-t-0 border-white/6
              bg-[#111110]
              lg:sticky lg:top-0 lg:h-[calc(100vh-64px)] lg:overflow-y-auto
            ">
              <div className="px-6 py-8 lg:py-10 flex flex-col h-full">

                <h2 className="text-base font-bold text-[#FBF8F2] mb-6">Order Summary</h2>

                {/* Line items breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666560]">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="text-[#FBF8F2] font-medium tabular-nums">
                      {new Intl.NumberFormat("en-RW").format(totalPrice)} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666560]">Delivery</span>
                    <span className="text-emerald-400 font-semibold">Free</span>
                  </div>
                  <div className="h-px bg-white/6" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-sm font-bold text-[#FBF8F2]">Total</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-[#666560]">RWF</span>
                      <span
                        className="text-2xl font-black text-[#F0B800] tracking-tight tabular-nums"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        {new Intl.NumberFormat("en-RW").format(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per-store mini list */}
                <div className="mb-6 space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-[#444340]">
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
                      bg-[#B87800] hover:bg-[#F0B800] text-[#111110]
                      flex items-center justify-center gap-2
                      transition-all duration-200
                      hover:shadow-[0_0_28px_rgba(240,184,0,0.28)]
                      active:scale-[0.98]
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                    "
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-[#111110]/30 border-t-[#111110] animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      <>Proceed to Checkout <ArrowRight size={15} strokeWidth={2.5} /></>
                    )}
                  </button>

                  <Link href="/marketplace" className="block lg:hidden">
                    <button className="w-full h-10 rounded-xl text-sm font-medium text-[#666560] hover:text-[#FBF8F2] border border-white/8 hover:border-white/16 hover:bg-white/4 transition-all duration-200">
                      Continue Shopping
                    </button>
                  </Link>
                </div>

                {/* Trust signals */}
                <div className="mt-5 space-y-2.5 pt-5 border-t border-white/6">
                  <TrustRow icon={ShieldCheck} color="text-emerald-400" label="2-hour escrow — pay only when satisfied" />
                  <TrustRow icon={Zap}         color="text-[#F0B800]"   label="Fast payouts to verified sellers" />
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
      </main>
    </div>
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
      <span className="text-[11px] text-[#555450] leading-snug">{label}</span>
    </div>
  );
}