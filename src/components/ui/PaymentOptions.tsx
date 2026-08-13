import { ShieldCheck, CreditCard, RotateCcw } from "lucide-react";

export function PaymentOptions() {
  return (
    <div className="space-y-4">
      <div className="bg-secondary/40 border border-border/80 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
          <ShieldCheck size={15} className="text-emerald-600" />
          <span>Accepted Payment Methods</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* MTN Momo Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
            <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-[7px] leading-none shrink-0">
              MTN
            </div>
            <span className="text-xs font-semibold text-foreground">MTN Mobile Money</span>
          </div>

          {/* Airtel Money Badge */}
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
            <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-[7px] leading-none shrink-0">
              Airtel
            </div>
            <span className="text-xs font-semibold text-foreground">Airtel Money</span>
          </div>

          {/* Cards Badge */}
          <div className="flex items-center gap-1.5 bg-secondary border border-border px-2.5 py-1 rounded-md">
            <CreditCard size={13} className="text-foreground" />
            <span className="text-xs font-semibold text-foreground">Visa / MasterCard</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border/80 shadow-2xs">
          <ShieldCheck size={16} className="text-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-foreground">Escrow Protected</h4>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Funds held safely until order confirmation</p>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border/80 shadow-2xs">
          <RotateCcw size={16} className="text-foreground shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-foreground">Easy Inspection</h4>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Verify item condition upon delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

