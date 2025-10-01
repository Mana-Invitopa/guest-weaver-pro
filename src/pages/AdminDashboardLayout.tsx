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
        {/* Desktop Sidebar - Only show on desktop (lg+) */}
        <div className="hidden lg:flex">
          <AdminSidebar />
        </div>
        
        <div className="flex-1 flex flex-col">
          {/* Mobile/Tablet Header - Only show below desktop */}
          <div className="lg:hidden">
            <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-40">
              <SidebarTrigger className="touch-target" />
              <h1 className="font-semibold text-foreground text-lg">Dashboard</h1>
              <div className="w-8"></div>
            </header>
          </div>

          {/* Desktop Navbar - Only show on desktop */}
          <div className="hidden lg:block border-b bg-card">
            <Navbar />
          </div>

          {/* Main content */}
          <main className={cn(
            "flex-1 overflow-x-hidden bg-background",
            "p-3 pb-20 mobile-scroll sm:p-4 lg:p-6 lg:pb-6"
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