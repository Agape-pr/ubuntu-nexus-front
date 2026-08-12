"use client";

import { Reveal } from "@/components/Reveal";
import { Heart, ShieldCheck, Zap, Clock, Shield, TrendingUp } from "lucide-react";

const values = [
  {
    icon: Heart,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "Community First",
    desc: "Every feature we build starts with one question: does this help local sellers and buyers connect better?",
  },
  {
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Trust by Design",
    desc: "Our escrow payment system protects both sides of every transaction. We hold the money until both parties are happy.",
  },
  {
    icon: Zap,
    color: "text-accent",
    bg: "bg-accent/10",
    title: "Instant Setup",
    desc: "A seller should be able to go from zero to live store in under 2 minutes. That is our bar.",
  },
];

const trustPoints = [
  { icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10",   title: "2-hour escrow protection", sub: "Safe & secured" },
  { icon: Shield,     color: "text-emerald-400", bg: "bg-emerald-500/10", title: "100% secure payments",     sub: "Powered by Pesapal" },
  { icon: Zap,        color: "text-sky-400",     bg: "bg-sky-500/10",     title: "Fast payouts",             sub: "Same-day transfers" },
  { icon: TrendingUp, color: "text-violet-400",  bg: "bg-violet-500/10",  title: "Trusted local commerce",   sub: "Growing every day" },
];

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 py-20 bg-background">
      <div className="container max-w-4xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">About us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">We are UbuntuNow</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Born in Kigali. Built for Africa. We believe commerce is more than a
            transaction — it&apos;s a relationship between people who share the
            same streets, markets, and dreams.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((item, i) => (
            <Reveal key={item.title} delay={i * 120} className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all">
              <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-5`}>
                <item.icon size={26} className={item.color} />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 text-center">
            Why merchants choose UbuntuNow
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustPoints.map((point, i) => (
              <Reveal
                key={point.title}
                delay={i * 90}
                className="flex flex-col items-center text-center gap-3 py-10 px-6 rounded-3xl bg-card border border-border hover:border-primary/30 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <div className={`h-14 w-14 rounded-2xl ${point.bg} flex items-center justify-center`}>
                  <point.icon size={24} className={point.color} />
                </div>
                <div>
                  <p className="font-bold text-foreground">{point.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{point.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
