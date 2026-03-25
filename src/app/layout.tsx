import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { FallingGolds } from "@/components/ui/FallingGolds";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BitLOT | Bitcoin Lottery Platform",
  description: "The next generation of provably fair Bitcoin lotteries. Secure, transparent, and community-driven.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-outfit antialiased bg-bg-light text-text-main relative min-h-screen overflow-x-hidden`}>
        <Providers>
          <FallingGolds />
          <div className="relative z-10 w-full flex flex-col min-h-screen">
             {children}
          </div>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
          />
        </Providers>
      </body>
    </html>
  );
}

