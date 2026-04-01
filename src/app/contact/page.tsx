"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    // Simulate a send — replace with real API call when ready
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We'll get back to you within 24 hours.");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary relative overflow-hidden py-20 md:py-28">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-6">
            <MessageCircle size={13} /> We're here to help
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Contact us
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Have a question, bug report, or partnership idea? Drop us a message and we'll get back to you within one business day.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-20 bg-background flex-1">
        <div className="container max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">

          {/* Info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Get in touch</h2>
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "support@ubuntunow.rw",
                  href: "mailto:support@ubuntunow.rw",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Kigali, Rwanda",
                  href: "#",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-secondary/60 rounded-3xl p-6 border border-border">
              <p className="text-sm font-semibold text-foreground mb-1">Response time</p>
              <p className="text-sm text-muted-foreground">We typically respond within <strong className="text-foreground">24 hours</strong> on business days.</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h3 className="font-bold text-xl text-foreground mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your name</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Pierre"
                  className="rounded-2xl h-11 border-border bg-secondary/30 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="rounded-2xl h-11 border-border bg-secondary/30 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="rounded-2xl border-border bg-secondary/30 focus:bg-white resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold gap-2 hover:-translate-y-0.5 transition-all"
              >
                {sending ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
