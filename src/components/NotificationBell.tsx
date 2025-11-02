import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    // Listen to RSVP changes across all user's events
    const channel = supabase
      .channel('user-rsvp-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
        },
        async (payload) => {
          const rsvpData = payload.new as any;
          
          // Check if this RSVP belongs to one of the user's events
          const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, title, admin_id')
            .eq('id', rsvpData.event_id)
            .eq('admin_id', user.id)
            .maybeSingle();

          if (event && !eventError) {
            // Fetch invitee details
            const { data: invitee } = await supabase
              .from('invitees')
              .select('name')
              .eq('id', rsvpData.invitee_id)
              .single();

            const guestName = invitee?.name || 'Un invité';
            const statusText = rsvpData.status === 'confirmed' 
              ? 'a confirmé sa présence' 
              : 'a décliné l\'invitation';

            setNotifications(prev => [{
              id: crypto.randomUUID(),
              message: `${guestName} ${statusText} à "${event.title}"`,
              timestamp: new Date(),
              read: false,
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notification.read ? 'bg-accent/10' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between w-full">
                  <p className="text-sm font-medium">{notification.message}</p>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-accent mt-1 ml-2" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp.toLocaleString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
