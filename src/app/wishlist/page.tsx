"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, X, ImageOff } from "lucide-react";
import { BuyerDashboardShell } from "@/components/BuyerDashboardShell";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { CloudImage } from "@/components/ui/CloudImage";

function WishlistContent() {
  const items = useWishlistStore((s) => s.items);
  const removeWishlist = useWishlistStore((s) => s.removeWishlist);

  return (
    <BuyerDashboardShell>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-1">Your account</p>
          <h1 className="font-display text-2xl text-white">
            Wishlist {items.length > 0 && <span className="text-white/40 font-medium">({items.length})</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl py-16 flex flex-col items-center text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Heart size={26} className="text-white/20" />
            </div>
            <h3 className="font-bold text-white/80 text-lg mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-white/40 mb-6">Tap the heart icon on any product to save it to your wishlist.</p>
            <Link
              href="/dashboard?view=shop"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-colors"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                  <Link
                    href={`/product/${encodeURIComponent(item.slug || item.id)}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/5 shrink-0">
                      {item.image ? (
                        <CloudImage
                          publicId={item.image}
                          alt={item.name}
                          width={56}
                          height={56}
                          crop="fill"
                          className="w-full h-full object-cover"
                          fallback={<div className="w-full h-full flex items-center justify-center text-xl"><ImageOff size={18} className="opacity-25" strokeWidth={1.5} /></div>}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl"><ImageOff size={18} className="opacity-25" strokeWidth={1.5} /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      {item.storeName && (
                        <p className="text-xs text-white/40 truncate">{item.storeName}</p>
                      )}
                      <p className="text-sm text-gold-accent font-bold mt-0.5">
                        RWF {new Intl.NumberFormat("en-RW").format(item.price)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BuyerDashboardShell>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p className="text-white/40">Loading...</p></div>}>
      <WishlistContent />
    </Suspense>
  );
}
