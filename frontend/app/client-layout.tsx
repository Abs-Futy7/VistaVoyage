
"use client";
import FloatingTravelBot from "@/components/Bot";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { RoutePreloader } from "@/components/RoutePreloader";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { CompilationWarmer } from "@/components/CompilationWarmer";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Memoize route checks to prevent unnecessary re-renders
  const routeConfig = useMemo(() => {
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAuthRoute = pathname?.startsWith('/auth');
    const showNavigation = !isAdminRoute && !isAuthRoute;
    
    return {
      isAdminRoute,
      isAuthRoute,
      showNavigation
    };
  }, [pathname]);
  
  return (
    <>
      {/* Performance monitoring, caching, route preloading, and compilation warming */}
      <PerformanceMonitor />
      <RoutePreloader />
      <ServiceWorkerRegistration />
      <CompilationWarmer />
      
      {routeConfig.showNavigation && <Navbar />}
      {children}
      <Toaster />
      {routeConfig.showNavigation && <FloatingTravelBot />}
      {routeConfig.showNavigation && <Footer />}
    </>
  );
}

export default ClientLayout;