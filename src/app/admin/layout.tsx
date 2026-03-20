import React, { Suspense } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-surface-50">
        <Suspense fallback={null}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
      </div>
    </AuthGuard>
  );
}
