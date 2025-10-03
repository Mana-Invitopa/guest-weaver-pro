import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";
import MobileNavigation from "@/components/MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - Always rendered, visibility controlled by SidebarProvider */}
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile/Tablet Header - Only show below desktop */}
          <div className="lg:hidden">
            <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-40 shadow-sm">
              <SidebarTrigger className="touch-target" />
              <h1 className="font-semibold text-foreground text-base sm:text-lg">Dashboard</h1>
              <div className="w-10"></div>
            </header>
          </div>

          {/* Desktop Navbar - Only show on desktop */}
          <div className="hidden lg:block border-b bg-card sticky top-0 z-30 shadow-sm">
            <Navbar />
          </div>

          {/* Main content */}
          <main className={cn(
            "flex-1 overflow-x-hidden bg-gradient-subtle",
            "p-3 pb-20 mobile-scroll sm:p-4 md:p-5 lg:p-6 lg:pb-6"
          )}>
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        {/* Mobile Navigation - Only show on mobile/tablet */}
        <div className="lg:hidden">
          <MobileNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}