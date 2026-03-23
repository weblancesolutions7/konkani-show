import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { NotificationProvider } from "@/components/ui/NotificationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${poppins.variable}`}>
      <body className="antialiased font-sans" data-brand="weblance-v1">
        <NotificationProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </NotificationProvider>
      </body>
    </html>
  );
}
