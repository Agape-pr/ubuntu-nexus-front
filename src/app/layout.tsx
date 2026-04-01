import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import "../index.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "UbuntuNow — Buy & Sell Locally in Rwanda",
  description: "UbuntuNow is Rwanda's trusted marketplace. Buy unique local products and sell online in minutes with escrow-protected payments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
