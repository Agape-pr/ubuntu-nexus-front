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
  { icon: MapPin, label: "Location", value: "Kigali, Rwanda", href: "https://www.google.com/maps/search/?api=1&query=Kigali%2C+Rwanda" },
];

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    const subject = `Message from ${form.name} via UbuntuNow`;
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app to send this to our team…");
  };

  return (
    <section id="contact" className="scroll-mt-16 py-20 bg-background border-t border-border">
      <div className="container max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <MessageCircle size={13} /> We&apos;re here to help
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Contact us</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question, bug report, or partnership idea? Drop us a message
            and we&apos;ll get back to you within one business day.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          <Reveal className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Get in touch</h3>
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4 mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{item.label}</p>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-foreground font-medium hover:text-primary transition-colors"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-3xl p-6 border border-border">
              <p className="text-sm font-semibold text-foreground mb-1">Response time</p>
              <p className="text-sm text-muted-foreground">
                We typically respond within <strong className="text-foreground">24 hours</strong> on business days.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} className="md:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h3 className="font-bold text-xl text-foreground mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Pierre"
                  className="rounded-2xl h-11 border-border bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email address</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="rounded-2xl h-11 border-border bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="rounded-2xl border-border bg-secondary/30 resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold gap-2 hover:-translate-y-0.5 transition-all"
              >
                <Send size={16} />
                Send message
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
