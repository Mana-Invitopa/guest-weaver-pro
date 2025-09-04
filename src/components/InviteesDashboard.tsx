import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  Filter,
  Download
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useInvitees } from "@/hooks/useInvitees";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InviteesDashboard = () => {
  const { data: events } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Get invitees for all events or selected event
  const eventIds = selectedEventId === "all" 
    ? events?.map(e => e.id) || [] 
    : [selectedEventId];
  
  // For now, we'll use the first event if available
  const firstEventId = events?.[0]?.id;
  const { data: allInvitees = [] } = useInvitees(firstEventId || '');

  const filteredInvitees = useMemo(() => {
    return allInvitees.filter(invitee => {
      const matchesSearch = invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invitee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "confirmed" && invitee.is_checked_in) ||
        (statusFilter === "pending" && !invitee.is_checked_in);
      
      return matchesSearch && matchesStatus;
    });
  }, [allInvitees, searchTerm, statusFilter]);

  const stats = {
    total: allInvitees.length,
    confirmed: allInvitees.filter(i => i.is_checked_in).length,
    pending: allInvitees.filter(i => !i.is_checked_in).length,
    withPhone: allInvitees.filter(i => i.phone).length
  };

  const getStatusBadge = (invitee: any) => {
    if (invitee.is_checked_in) {
      return <Badge className="bg-success text-success-foreground">Présent</Badge>;
    }
    return <Badge variant="secondary">En attente</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invités</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmés</p>
                <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avec Téléphone</p>
                <p className="text-2xl font-bold text-accent">{stats.withPhone}</p>
              </div>
              <Phone className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Liste des Invités
              </CardTitle>
              <CardDescription>
                Gérez vos invités et suivez leurs statuts
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un invité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>

            {events && events.length > 1 && (
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les événements</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvitees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {allInvitees.length === 0 ? "Aucun invité" : "Aucun résultat"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {allInvitees.length === 0 
                  ? "Commencez par créer un événement et ajouter des invités"
                  : "Essayez de modifier vos critères de recherche"
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invité</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Check-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitees.map((invitee) => (
                    <TableRow key={invitee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invitee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {invitee.token?.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {invitee.email}
                          </div>
                          {invitee.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {invitee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {invitee.table_number ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Table {invitee.table_number}
                            {invitee.table_name && (
                              <span className="text-muted-foreground">
                                ({invitee.table_name})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assignée</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(invitee)}
                      </TableCell>
                      
                      <TableCell>
                        {invitee.checked_in_at ? (
                          <div className="text-sm text-muted-foreground">
                            {new Date(invitee.checked_in_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteesDashboard;