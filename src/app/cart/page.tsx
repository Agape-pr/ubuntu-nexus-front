"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { PaymentOptions } from "@/components/ui/PaymentOptions";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, getTotalPrice, updateQuantity } = useCartStore();
  const totalPrice = getTotalPrice();

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
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-bold text-foreground">
                        {new Intl.NumberFormat('en-RW').format(item.price)} RWF
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          className="bg-secondary border-none rounded-lg text-sm px-2 py-1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        >
                          {[1,2,3,4,5].map(q => <option key={q} value={q}>Qty: {q}</option>)}
                        </select>
                        <button 
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
                
                <Button size="lg" className="w-full gradient-amber text-primary hover:scale-[1.02] transition-transform rounded-xl font-bold shadow-amber border-0 mb-6">
                  Proceed to Checkout <ArrowRight size={16} className="ml-2" />
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
