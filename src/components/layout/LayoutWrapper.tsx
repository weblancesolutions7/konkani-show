'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <div className={isAdminRoute ? "" : "min-h-[80vh]"}>
        {children}
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
}
