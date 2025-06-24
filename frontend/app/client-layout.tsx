
"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/auth');
  
  return (
    <>
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      {children}
      <Toaster />
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </>
  );
}

export default ClientLayout;