import { Sparkles, ArrowRight } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#111110] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7A4F00]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#B87800]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 text-center max-w-2xl w-full">
        {/* Logo / Brand */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1A1A19] border border-white/10 rounded-full shadow-lg">
            <span className="text-[#FBF8F2] font-black text-xl tracking-tight">Ubuntu</span>
            <span className="text-[#111110] bg-[#B87800] px-2 py-0.5 rounded-sm font-black text-xl italic tracking-tight">
              Now
            </span>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl md:text-6xl font-black text-[#FBF8F2] mb-6 leading-tight tracking-tight animate-fade-up">
          The future of <span className="text-[#B87800]">Rwandan commerce</span> is almost here.
        </h1>
        
        <p className="text-lg text-[#888780] mb-12 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "100ms" }}>
          We are putting the final touches on a revolutionary marketplace connecting buyers directly to sellers with zero friction.
        </p>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-[#1A1A19] border border-white/10 p-2 pl-6 rounded-full flex items-center justify-between max-w-md mx-auto">
            <span className="text-white/40 text-sm font-medium">Get notified when we launch</span>
            <button className="flex items-center gap-2 bg-[#B87800] text-[#111110] px-6 py-3 rounded-full font-black text-sm hover:bg-[#F0B800] transition-colors">
              Join Waitlist <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-16 flex items-center justify-center gap-2 text-[#888780] text-sm animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Systems in final testing
        </div>
      </div>
    </div>
  );
}
