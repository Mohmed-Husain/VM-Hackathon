import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "eVisa Portal | Official Government of India",
  description: "Your official gateway to visit India. Simple, secure and hassle-free electronic visa application portal.",
  icons: {
    icon: "/assets/emblem.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2A6F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
