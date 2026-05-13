"use client";

import { Sparkles, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  const SURVEY_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSelEh_KeKRiNVo4YvtQbyVAMOgrkuxYQl3oB8edthADpUm-sg/viewform?usp=header";

  return (
    <div className="min-h-screen bg-[#111110] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7A4F00]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#B87800]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 text-center max-w-3xl w-full">
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
        
        <p className="text-lg text-[#888780] mb-12 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "100ms" }}>
          We are putting the final touches on a revolutionary marketplace connecting buyers directly to sellers with zero friction.
        </p>

        <div className="space-y-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
          {/* Waitlist Email Capture */}
          {submitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 max-w-md mx-auto text-emerald-500">
              <CheckCircle2 size={24} />
              <span className="font-bold">You're on the list! We'll be in touch soon.</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="bg-[#1A1A19] border border-white/10 p-2 pl-6 rounded-full flex flex-col sm:flex-row items-center justify-between max-w-lg mx-auto gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for the waitlist" 
                className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-white/30 h-10"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-[#B87800] text-[#111110] px-6 py-3 rounded-full font-black text-sm hover:bg-[#F0B800] transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-70"
              >
                {loading ? "Joining..." : "Join Waitlist"} <ArrowRight size={16} strokeWidth={3} />
              </button>
            </form>
          )}

          {/* Survey Link */}
          <div className="pt-8 border-t border-white/5 max-w-lg mx-auto">
            <p className="text-[#FBF8F2] font-bold mb-2">Are you a seller in Rwanda?</p>
            <p className="text-sm text-[#888780] mb-4">
              Help us shape a platform built to make selling easier, faster, and more profitable for you. Takes only 3 minutes!
            </p>
            <a 
              href={SURVEY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[#FBF8F2] hover:bg-white/10 transition-colors font-bold text-sm"
            >
              <Sparkles size={16} className="text-[#B87800]" />
              Share your insights via Survey
              <ExternalLink size={14} className="text-white/40 ml-1" />
            </a>
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
