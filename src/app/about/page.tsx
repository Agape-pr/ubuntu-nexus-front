"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Heart, Zap, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary relative overflow-hidden py-20 md:py-32">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald/10 blur-3xl pointer-events-none" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-6">
            <MapPin size={13} /> Kigali, Rwanda
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            We are <span className="text-accent">UbuntuNow</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed">
            Born in Kigali. Built for Africa. We believe commerce is more than a transaction — it's a relationship between people who share the same streets, markets, and dreams.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our mission</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              To make it as simple as possible for every Rwandan entrepreneur — no matter how small — to sell online and reach customers securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                color: "text-rose-500",
                bg: "bg-rose-50",
                title: "Community First",
                desc: "Every feature we build starts with one question: does this help local sellers and buyers connect better?",
              },
              {
                icon: ShieldCheck,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                title: "Trust by Design",
                desc: "Our escrow payment system protects both sides of every transaction. We hold the money until both parties are happy.",
              },
              {
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-50",
                title: "Instant Setup",
                desc: "A seller should be able to go from zero to live store in under 2 minutes. That is our bar.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center hover:shadow-md transition-all">
                <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-5`}>
                  <item.icon size={26} className={item.color} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The name */}
      <section className="py-20 bg-secondary/40">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Why "UbuntuNow"?</h2>
          <blockquote className="text-2xl md:text-3xl font-light text-foreground/80 italic leading-relaxed mb-6">
            "Umuntu ngumuntu ngabantu."
          </blockquote>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            A Nguni Bantu phrase meaning <strong className="text-foreground">"I am because we are."</strong> Ubuntu is the philosophy that we thrive through each other — not in spite of each other. We added <em>Now</em> because opportunity shouldn't wait.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
