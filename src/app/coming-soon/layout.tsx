import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UbuntuNow | Coming Soon",
  description:
    "The missing tech infrastructure and trust layer for digital commerce in Rwanda. Join the waitlist.",
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout simply passes through children.
  // The root layout handles <html> and <body>.
  // When deploying to main, this page.tsx replaces the root page.tsx
  // and uses the simplified root layout.
  return <>{children}</>;
}
