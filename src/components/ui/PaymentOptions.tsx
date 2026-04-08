import { ShieldCheck, Truck, CreditCard, RotateCcw } from "lucide-react";

export function PaymentOptions() {
  return (
    <div className="space-y-6">
      <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <ShieldCheck size={16} className="text-emerald" />
          <span>Secure payments via Pesapal</span>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {/* MTN Momo Mock Badge */}
          <div className="flex items-center gap-1.5 bg-[#FFCC00]/10 border border-[#FFCC00]/30 px-3 py-1.5 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-[#FFCC00] flex items-center justify-center text-black font-bold text-[8px] leading-none shrink-0">
              MTN
            </div>
            <span className="text-xs font-semibold text-foreground">MoMo</span>
          </div>

          {/* Airtel Money Mock Badge */}
          <div className="flex items-center gap-1.5 bg-[#FF0000]/10 border border-[#FF0000]/20 px-3 py-1.5 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold text-[8px] leading-none shrink-0">
              airtel
            </div>
            <span className="text-xs font-semibold text-foreground">Money</span>
          </div>

          {/* Cards Mock Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900/5 border border-slate-900/10 dark:bg-white/5 dark:border-white/10 px-3 py-1.5 rounded-lg">
            <CreditCard size={14} className="text-slate-700 dark:text-slate-300" />
            <span className="text-xs font-semibold text-foreground">Cards</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
          <div className="mt-0.5 text-primary">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-0.5">Escrow Protection</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Funds held until you receive the item</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border/50 shadow-sm">
          <div className="mt-0.5 text-primary">
            <RotateCcw size={18} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-0.5">Easy Returns</h4>
            <p className="text-[10px] text-muted-foreground leading-tight">Return within 2 hours of delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
