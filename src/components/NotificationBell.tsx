import { Bell, CheckCircle2, XCircle, UserCheck, Zap, Mail } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalNotifications } from "@/hooks/useGlobalNotifications";
import { useNavigate } from "react-router-dom";

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useGlobalNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rsvp_confirmed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'rsvp_declined':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'check_in':
        return <UserCheck className="w-4 h-4 text-accent" />;
      case 'workflow_completed':
        return <Zap className="w-4 h-4 text-primary" />;
      case 'reminder_sent':
        return <Mail className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.eventId) {
      navigate(`/admin/events/${notification.eventId}`);
    }
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
        <DropdownMenuLabel className="flex items-center justify-between border-b pb-2">
          <span className="font-bold">Notifications</span>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-auto p-1 text-xs hover:text-destructive"
              >
                Effacer
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs"
              >
                Marquer comme lu
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer rounded-lg transition-smooth ${
                    !notification.read ? 'bg-accent/10 hover:bg-accent/20' : 'hover:bg-muted'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                      )}
                    </div>
                    {notification.eventTitle && (
                      <p className="text-xs text-muted-foreground">
                        📅 {notification.eventTitle}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
