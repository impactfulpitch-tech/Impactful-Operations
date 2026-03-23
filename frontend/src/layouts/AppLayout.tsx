import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInitializeStorage } from "@/hooks/useInitializeStorage";
import AppSidebar from "@/components/AppSidebar";
import { TopHeaderBar } from "@/components/TopHeaderBar";
import { RemindersAlertBanner } from "@/components/RemindersAlertBanner";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Initialize localStorage on app start
  useInitializeStorage();

  // Protect routes - redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <AppSidebar />
      <TopHeaderBar />
      <RemindersAlertBanner />
      <main
        className={`min-h-screen transition-all duration-300 ${
          isMobile ? "ml-0 mt-14" : "ml-56 mt-16"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
