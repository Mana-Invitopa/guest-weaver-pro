import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Calendar, Users, Settings, BarChart3, QrCode, 
  CheckCircle, Plus, Edit, Table, Mail, ChevronDown,
  UserCheck, FileText, Home, Archive, Share, Zap, Shield, Activity
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavItems = [
  { title: "Tableau de Bord", url: "/admin", icon: Home },
  { title: "Créer un Événement", url: "/admin/events/new", icon: Plus },
];

const eventManagementItems = [
  { title: "Tous les Événements", url: "/admin/events", icon: Calendar },
  { title: "Événements Actifs", url: "/admin/events/active", icon: CheckCircle },
  { title: "Événements Archivés", url: "/admin/events/archived", icon: Archive },
  { title: "Analyses & Statistiques", url: "/admin/analytics", icon: BarChart3 },
  { title: "Workflows", url: "/admin/workflows", icon: Zap },
  { title: "Programmation", url: "/admin/scheduler", icon: Calendar },
  { title: "Pulse Monitor", url: "/admin/pulse", icon: Activity },
  { title: "Gestion Contenu", url: "/admin/content", icon: FileText },
];

const systemItems = [
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { eventId } = useParams();
  const currentPath = location.pathname;
  
  const [isEventManagementOpen, setIsEventManagementOpen] = useState(true);
  const [isCurrentEventOpen, setIsCurrentEventOpen] = useState(!!eventId);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive: active }: { isActive: boolean }) =>
    `flex items-center w-full ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"}`;

  const currentEventItems = eventId ? [
    { title: "Vue d'ensemble", url: `/admin/events/${eventId}`, icon: Calendar },
    { title: "Invités", url: `/admin/events/${eventId}/guests`, icon: Users },
    { title: "QR Codes", url: `/admin/events/${eventId}/qr`, icon: QrCode },
    { title: "Check-in", url: `/admin/events/${eventId}/checkin`, icon: UserCheck },
    { title: "Tables", url: `/admin/events/${eventId}/tables`, icon: Table },
    { title: "Invitations", url: `/admin/events/${eventId}/invitations`, icon: Mail },
    { title: "Partage Invitations", url: `/admin/events/${eventId}/share`, icon: Share },
    { title: "Collaborateurs", url: `/admin/events/${eventId}/collaborators`, icon: Users },
    { title: "Livre d'Or", url: `/admin/events/${eventId}/guestbook`, icon: FileText },
    { title: "Workflows", url: `/admin/events/${eventId}/workflows`, icon: Zap },
    { title: "Confidentialité", url: `/admin/events/${eventId}/privacy`, icon: Shield },
    { title: "Paramètres", url: `/admin/events/${eventId}/settings`, icon: Settings },
  ] : [];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation Principale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Event Management */}
        <SidebarGroup>
          <Collapsible open={isEventManagementOpen} onOpenChange={setIsEventManagementOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-sidebar-accent/50 px-2 py-1 rounded">
                Gestion des Événements
                {!collapsed && <ChevronDown className={`h-4 w-4 transition-transform ${isEventManagementOpen ? 'rotate-0' : '-rotate-90'}`} />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {eventManagementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                          <item.icon className="mr-3 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Current Event Management */}
        {eventId && (
          <SidebarGroup>
            <Collapsible open={isCurrentEventOpen} onOpenChange={setIsCurrentEventOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-sidebar-accent/50 px-2 py-1 rounded">
                  Événement Actuel
                  {!collapsed && <ChevronDown className={`h-4 w-4 transition-transform ${isCurrentEventOpen ? 'rotate-0' : '-rotate-90'}`} />}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {currentEventItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                            <item.icon className="mr-3 h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* System Settings */}
        <SidebarGroup>
          <Collapsible open={isSystemOpen} onOpenChange={setIsSystemOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-sidebar-accent/50 px-2 py-1 rounded">
                Système
                {!collapsed && <ChevronDown className={`h-4 w-4 transition-transform ${isSystemOpen ? 'rotate-0' : '-rotate-90'}`} />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className={getNavCls({ isActive: isActive(item.url) })}>
                          <item.icon className="mr-3 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AdminSidebar;