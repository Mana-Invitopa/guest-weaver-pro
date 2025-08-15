import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye, TrendingUp, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location: string;
  status?: string;
  current_guests?: number;
  max_guests?: number;
  event_type?: string;
  background_image_url?: string;
}

interface EventPreviewCardProps {
  event: Event;
  showStats?: boolean;
}

const getEventTypeInfo = (eventType: string) => {
  const types: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
    'wedding': { label: 'Mariage', color: 'text-rose-500', icon: Star },
    'party': { label: 'Fête', color: 'text-purple-500', icon: Users },
    'conference': { label: 'Conférence', color: 'text-blue-500', icon: TrendingUp },
    'charity': { label: 'Charité', color: 'text-green-500', icon: Users },
    'festival': { label: 'Festival', color: 'text-orange-500', icon: Star },
    'theatre': { label: 'Théâtre', color: 'text-indigo-500', icon: Star },
    'cinema': { label: 'Cinéma', color: 'text-red-500', icon: Eye },
    'corporate': { label: 'Entreprise', color: 'text-yellow-500', icon: TrendingUp },
  };
  
  return types[eventType] || { label: eventType || 'Événement', color: 'text-gray-500', icon: Calendar };
};

const getStatusBadge = (status: string, dateTime: string) => {
  const eventDate = new Date(dateTime);
  const now = new Date();
  
  if (eventDate > now) {
    return <Badge className="bg-primary text-primary-foreground">À venir</Badge>;
  } else if (eventDate.toDateString() === now.toDateString()) {
    return <Badge className="bg-success text-success-foreground">En cours</Badge>;
  } else {
    return <Badge variant="secondary">Terminé</Badge>;
  }
};

const getTimeUntilEvent = (dateTime: string) => {
  const eventDate = new Date(dateTime);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  
  if (diff < 0) return "Événement terminé";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Dans ${hours}h`;
  return "Bientôt";
};

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({ event, showStats = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const typeInfo = getEventTypeInfo(event.event_type || '');
  const TypeIcon = typeInfo.icon;
  
  useEffect(() => {
    if (event.background_image_url) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = event.background_image_url;
    }
  }, [event.background_image_url]);

  return (
    <Card className="shadow-card hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Event Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {event.background_image_url && imageLoaded ? (
          <img 
            src={event.background_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
            <TypeIcon className={`w-16 h-16 ${typeInfo.color} opacity-50`} />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-black">
            <TypeIcon className={`w-3 h-3 mr-1 ${typeInfo.color}`} />
            {typeInfo.label}
          </Badge>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {getStatusBadge(event.status || 'draft', event.date_time)}
        </div>
        
        {/* Title and Time */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold mb-1 truncate">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>{getTimeUntilEvent(event.date_time)}</span>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Description */}
          {event.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {event.description}
            </p>
          )}
          
          {/* Event Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(event.date_time).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(event.date_time).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.location}</span>
            </div>
            
            {showStats && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  {event.current_guests || 0} 
                  {event.max_guests ? ` / ${event.max_guests}` : ''} invité{(event.current_guests || 0) > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1 bg-gradient-primary">
              <Link to={`/admin/events/${event.id}`}>
                Gérer l'événement
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/event-preview/${event.id}`} target="_blank">
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventPreviewCard;