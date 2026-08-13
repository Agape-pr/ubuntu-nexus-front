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
    <section id="contact" className="scroll-mt-16 py-20 bg-background border-t border-border/60">
      <div className="container max-w-5xl mx-auto px-4">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/80 text-muted-foreground text-xs font-medium mb-3">
            <MessageCircle size={13} /> Contact Support
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Get in Touch</h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Have questions about buying, selling, or escrow protection? Reach out and our Kigali support team will respond promptly.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <Reveal className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Contact Information</h3>
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-3.5 mb-5">
                  <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-foreground">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-foreground text-sm font-medium hover:text-primary transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border/80 shadow-2xs">
              <p className="text-xs font-semibold text-foreground mb-1">Support Hours</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monday – Saturday, 8:00 AM – 6:00 PM CAT. Inquiries are handled within 24 hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100} className="md:col-span-3 bg-card border border-border/80 rounded-xl p-6 sm:p-8 shadow-2xs">
            <h3 className="font-bold text-lg text-foreground mb-5">Send Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Your Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Paul"
                  className="rounded-lg h-10 border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jeanpaul@example.com"
                  className="rounded-lg h-10 border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={4}
                  className="rounded-lg border-border bg-background text-sm resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold gap-2"
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

