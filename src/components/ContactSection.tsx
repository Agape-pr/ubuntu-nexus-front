"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";

const SUPPORT_EMAIL = "support@ubuntunow.rw";

const CONTACT_INFO = [
  { icon: Mail, label: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: MapPin, label: "Office", value: "Kigali, Rwanda", href: "https://www.google.com/maps/search/?api=1&query=Kigali%2C+Rwanda" },
];

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields to send a message.");
      return;
    }
    const subject = `Message from ${form.name} via UbuntuNow`;
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email client to send message...");
  };

  return (
    <section id="contact" className="scroll-mt-16 min-h-screen flex flex-col justify-center py-20 bg-background border-t border-border/60">
      <div className="container max-w-5xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Get in Touch</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Have questions about buying, selling, or escrow protection? Reach out and our support team will respond promptly.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          <Reveal className="md:col-span-2 space-y-4">
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-2xs space-y-5">
              <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3">Contact Information</h3>
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-secondary border border-border/60 flex items-center justify-center shrink-0 text-primary">
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-foreground text-sm font-semibold hover:text-primary transition-colors truncate block"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-1">
              <p className="text-xs font-bold text-foreground">Support Hours</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monday – Saturday, 8:00 AM – 6:00 PM CAT. Inquiries are handled within 24 hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="md:col-span-3 bg-card border border-border/80 rounded-2xl p-5 md:p-8 shadow-2xs">
            <h3 className="font-bold text-base md:text-lg text-foreground mb-4">Send Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Your Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Paul"
                  className="rounded-xl h-10 border-border/80 bg-secondary/30 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jeanpaul@example.com"
                  className="rounded-xl h-10 border-border/80 bg-secondary/30 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={4}
                  className="rounded-xl border-border/80 bg-secondary/30 text-sm resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold gap-2 shadow-2xs"
              >
                <Send size={15} />
                Send Message
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

