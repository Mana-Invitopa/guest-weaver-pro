import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Mail, MessageSquare, CheckCircle, XCircle, Users, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvitees, useCreateInvitee, type Invitee } from "@/hooks/useInvitees";
import InvitationSender from "./InvitationSender";
import PDFInvitationSender from "./PDFInvitationSender";

interface GuestManagementProps {
  eventId: string;
}

const GuestManagement = ({ eventId }: GuestManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  const { toast } = useToast();
  const { data: invitees = [], isLoading } = useInvitees(eventId);
  const createInviteeMutation = useCreateInvitee();

  const filteredGuests = invitees.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.email) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createInviteeMutation.mutateAsync({
        event_id: eventId,
        name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone || undefined,
      });

      setNewGuest({ name: "", email: "", phone: "" });
      setIsAddingGuest(false);
      
      toast({
        title: "Succès",
        description: "Invité ajouté avec succès !",
      });
    } catch (error) {
      console.error('Error adding guest:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'invité",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      // Parse CSV (name, email, phone)
      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header and empty lines
        
        const [name, email, phone] = line.split(',').map(s => s.trim());
        if (name && email) {
          createInviteeMutation.mutate({
            event_id: eventId,
            name,
            email,
            phone: phone || undefined,
          });
        }
      });
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (invitee: Invitee) => {
    if (invitee.is_checked_in) {
      return <Badge variant="secondary" className="bg-success text-success-foreground">Présent</Badge>;
    }
    // Check if they have an RSVP (would need to query rsvps table)
    return <Badge variant="outline">En attente</Badge>;
  };

  const stats = {
    total: invitees.length,
    checkedIn: invitees.filter(g => g.is_checked_in).length,
    pending: invitees.filter(g => !g.is_checked_in).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invités</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Présents</p>
                <p className="text-2xl font-bold text-success">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              </div>
              <XCircle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestion des Invités</CardTitle>
              <CardDescription>
                Gérez votre liste d'invités et suivez leur présence
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Importer CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importer des invités</DialogTitle>
                    <DialogDescription>
                      Importez une liste d'invités depuis un fichier CSV (Nom, Email, Téléphone)
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleBulkImport}
                  />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddingGuest} onOpenChange={setIsAddingGuest}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un Invité
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un Invité</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouvel invité à votre événement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={newGuest.name}
                        onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newGuest.email}
                        onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jean@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newGuest.phone}
                        onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddGuest} className="flex-1">
                        Ajouter
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingGuest(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Liste des Invités</TabsTrigger>
              <TabsTrigger value="send">Invitations Standard</TabsTrigger>
              <TabsTrigger value="pdf">Invitations PDF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un invité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell>{guest.email}</TableCell>
                        <TableCell>{guest.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(guest)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="send">
              <InvitationSender eventId={eventId} invitees={invitees} />
            </TabsContent>

            <TabsContent value="pdf">
              <PDFInvitationSender eventId={eventId} invitees={invitees} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestManagement;