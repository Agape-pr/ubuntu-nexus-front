import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UbuntuNow | Coming Soon",
  description: "The future of Rwandan commerce. Zero-friction marketplace connecting buyers directly to sellers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#111110] text-[#FBF8F2]">
        {children}
      </body>
    </html>
  );
}
