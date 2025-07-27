import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // 1. Make sure this import exists

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thelo",
  description: "B2B Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. This is the most important part. CartProvider MUST wrap {children}. */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}