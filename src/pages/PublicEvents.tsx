import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Clock, 
  Users,
  Star,
  TrendingUp,
  Eye,
  Heart,
  Music,
  Camera,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { usePublicEvents, useEventTypes, useEventLocations } from "@/hooks/usePublicEvents";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PublicEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    event_type: selectedType || undefined,
    location: selectedLocation || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [searchTerm, selectedType, selectedLocation, dateFrom, dateTo]);

  const { data: events, isLoading } = usePublicEvents(filters);
  const { data: eventTypes } = useEventTypes();
  const { data: locations } = useEventLocations();

  const getEventTypeIcon = (eventType: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'wedding': Heart,
      'party': Music,
      'conference': TrendingUp,
      'charity': Heart,
      'festival': Music,
      'theatre': Star,
      'cinema': Camera,
      'corporate': TrendingUp,
    };
    return icons[eventType] || Calendar;
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'wedding': 'Mariage',
      'party': 'Fête',
      'conference': 'Conférence',
      'charity': 'Charité',
      'festival': 'Festival',
      'theatre': 'Théâtre',
      'cinema': 'Cinéma',
      'corporate': 'Entreprise',
    };
    return labels[eventType] || eventType;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedLocation("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchTerm || selectedType || selectedLocation || dateFrom || dateTo;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-hero text-white py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Événements Publics
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
            Découvrez les événements publics à venir dans votre région
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        {/* Filters */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Effacer
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Event Type */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {eventTypes?.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getEventTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les localisations</SelectItem>
                  {locations?.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Date de début"
              />

              {/* Date To */}
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Date de fin"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-card">
                <div className="h-48 bg-muted animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !events?.length ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun événement trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Aucun événement ne correspond à vos critères de recherche."
                  : "Il n'y a pas d'événements publics disponibles pour le moment."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const EventIcon = getEventTypeIcon(event.event_type || '');
              const isExpired = isPast(new Date(event.date_time));
              
              return (
                <Card key={event.id} className="shadow-card hover:shadow-elegant transition-all duration-300 overflow-hidden group">
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    {event.background_image_url ? (
                      <img 
                        src={event.background_image_url} 
                        alt={event.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isExpired ? 'opacity-60 grayscale' : ''}`}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-hero flex items-center justify-center ${isExpired ? 'opacity-60 grayscale' : ''}`}>
                        <EventIcon className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 ${isExpired ? 'bg-black/60' : 'bg-black/40'}`}></div>
                    
                    {/* Event Type Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge variant="secondary" className="bg-white/90 text-black w-fit">
                        <EventIcon className="w-3 h-3 mr-1" />
                        {getEventTypeLabel(event.event_type || '')}
                      </Badge>
                      {isExpired && (
                        <Badge variant="destructive" className="w-fit">
                          <Clock className="w-3 h-3 mr-1" />
                          Événement terminé
                        </Badge>
                      )}
                    </div>
                    
                    {/* Event Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Event Details */}
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {/* Description */}
                      {event.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>
                          {format(new Date(event.date_time), 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(event.date_time), 'HH:mm')}
                        </span>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      
                      {/* Guests */}
                      {(event.current_guests || event.max_guests) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.current_guests || 0}
                            {event.max_guests ? ` / ${event.max_guests}` : ''} participants
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="mt-6">
                      <Button asChild className="w-full bg-gradient-primary hover:shadow-gold transition-smooth">
                        <Link to={`/event/${event.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir l'événement
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PublicEvents;