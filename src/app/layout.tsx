import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "../index.css";

export const metadata: Metadata = {
  title: "UbuntuNow — Buy & Sell Locally in Rwanda",
  description: "UbuntuNow is Rwanda's trusted marketplace. Buy unique local products and sell online in minutes with escrow-protected payments.",
};

import MobileNav from "@/components/MobileNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased md:pb-0 pb-14">
        <Providers>
          {children}
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
