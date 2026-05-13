"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
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
      // Get authentication token
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        toast.error("Please log in to proceed with checkout.");
        router.push("/auth");
        return;
      }

      // Check delivery address
      if (!userProfile?.address_line1) {
        toast.error("Please add a delivery address to checkout.", {
          action: {
            label: "Add Address",
            onClick: () => router.push("/profile")
          }
        });
        router.push("/profile");
        return;
      }

      // 1. Create the order
      const orderPayload = {
        delivery_address: {
          address_line1: userProfile.address_line1,
          address_line2: userProfile.address_line2,
          city: userProfile.city,
          country: userProfile.country,
        },
        items: items.map(item => {
          // Backward compatibility: if productId doesn't exist, try parsing id (which might be the raw product id if no variations)
          const realId = item.productId || item.id.toString().split('-')[0];
          return {
            product_id: parseInt(realId, 10), 
            quantity: item.quantity,
            selected_variations: item.selected_variations || {}
          };
        })
      };
      
      const orderRes = await fetch(`${API_BASE_URL}/orders/checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const orders = await orderRes.json();
      
      // We process the first order in the batch (assuming single store for simple testing)
      if (orders && orders.length > 0) {
        const orderId = orders[0].id;
        
        // 2. Trigger mock payment
        const paymentRes = await fetch(`${API_BASE_URL}/orders/${orderId}/mock-payment/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!paymentRes.ok) throw new Error('Payment simulation failed');
        
        // Success
        clearCart();
        toast.success('Order placed successfully! The payment has been held in escrow.', {
          duration: 5000,
        });
        router.push('/'); // Or redirect to an orders dashboard
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.message || "Failed to complete checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-16 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-secondary/30 rounded-3xl border border-border/50 text-center">
            <ShoppingBag size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">Cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/marketplace">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.storeName || "Unknown store"}</p>
                      
                      {/* Variations display */}
                      {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 mb-1">
                          {Object.entries(item.selected_variations).map(([k, v]) => (
                            <span key={k} className="text-[11px] font-medium bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-md border border-border/40">
                              <span className="text-muted-foreground mr-1">{k}:</span>
                              {v as string}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Delivery expectation label */}
                      {item.in_stock === true && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
                          ⚡ Ready for quick delivery
                        </span>
                      )}
                      {item.in_stock === false && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1">
                          📦 Confirm &amp; deliver same day
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-foreground">
                        {new Intl.NumberFormat('en-RW').format(item.price)} RWF
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Qty stepper */}
                        <div className="flex items-center h-8 bg-secondary rounded-lg border border-border overflow-hidden">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border/60 transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-foreground select-none">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border/60 transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          aria-label="Remove item"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-3xl p-6 border border-border shadow-sm sticky top-24">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">{new Intl.NumberFormat('en-RW').format(totalPrice)} RWF</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-emerald font-medium">Free</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{new Intl.NumberFormat('en-RW').format(totalPrice)} RWF</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full gradient-amber text-primary hover:scale-[1.02] transition-transform rounded-xl font-bold shadow-amber border-0 mb-6"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : (
                    <>Proceed to Checkout <ArrowRight size={16} className="ml-2" /></>
                  )}
                </Button>
                
                <PaymentOptions />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
