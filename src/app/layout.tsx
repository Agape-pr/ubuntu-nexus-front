import "../index.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "UbuntuNow | Coming Soon",
  description: "The missing tech infrastructure and trust layer for digital commerce in Rwanda.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#111110] text-[#FBF8F2]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
