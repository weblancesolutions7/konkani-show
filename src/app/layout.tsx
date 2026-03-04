import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Konkani Show Platform | Book Best Konkani Events",
  description: "The ultimate platform for Konkani shows, drama, and activities. Direct booking and event listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans" data-brand="weblance-v1">
        <Header />
        <div className="min-h-[80vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
