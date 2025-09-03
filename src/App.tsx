import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEventsPage from "./pages/AdminEventsPage";
import EventCreation from "./pages/EventCreation";
import InvitationPage from "./pages/InvitationPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboardLayout from "./pages/AdminDashboardLayout";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PublicEvents from "./pages/PublicEvents";
import PublicEventDetail from "./pages/PublicEventDetail";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/invitation/:token?" element={<InvitationPage />} />
            
            {/* Admin Routes with Layout */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminEventsPage />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/new" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <EventCreation />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/edit" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <EventCreation />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/guests" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/qr" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/checkin" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/tables" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/invitations" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/guestbook" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/collaborators" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/share" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminDashboard />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/active" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminEventsPage />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/archived" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <AdminEventsPage />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <Analytics />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <AdminDashboardLayout>
                    <Settings />
                  </AdminDashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            
            {/* Public Events Routes */}
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/event/:eventId" element={<PublicEventDetail />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;