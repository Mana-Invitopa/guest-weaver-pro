import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Search, UserCheck, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvitees, useCheckInInvitee } from "@/hooks/useInvitees";

interface CheckInSystemProps {
  eventId: string;
}

const CheckInSystem = ({ eventId }: CheckInSystemProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scanMode, setScanMode] = useState(false);
  
  const { toast } = useToast();
  const { data: invitees = [], isLoading } = useInvitees(eventId);
  const checkInMutation = useCheckInInvitee();

  const filteredInvitees = invitees.filter(invitee => 
    invitee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invitee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invitee.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: invitees.length,
    checkedIn: invitees.filter(i => i.is_checked_in).length,
    pending: invitees.filter(i => !i.is_checked_in).length,
  };

  const handleCheckIn = async (token: string, guestName: string) => {
    try {
      await checkInMutation.mutateAsync(token);
      
      toast({
        title: "Check-in réussi !",
        description: `${guestName} a été enregistré comme présent`,
      });
    } catch (error) {
      console.error('Error checking in guest:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la présence",
        variant: "destructive",
      });
    }
  };

  const handleBulkSearch = (query: string) => {
    setSearchTerm(query);
    
    // If it's a token (longer string), try to find and check in automatically
    if (query.length > 10) {
      const invitee = invitees.find(i => i.token.toLowerCase().includes(query.toLowerCase()));
      if (invitee && !invitee.is_checked_in) {
        handleCheckIn(invitee.token, invitee.name);
        setSearchTerm(""); // Clear search after auto check-in
      }
    }
  };

  const formatCheckInTime = (timestamp?: string) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
                <p className="text-sm text-muted-foreground">Taux de présence</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Interface */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Système de Check-in</CardTitle>
          <CardDescription>
            Scannez un QR code ou recherchez un invité pour enregistrer sa présence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou scanner QR code..."
                value={searchTerm}
                onChange={(e) => handleBulkSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={scanMode ? "default" : "outline"}
              onClick={() => setScanMode(!scanMode)}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {scanMode ? "Mode manuel" : "Mode scan"}
            </Button>
          </div>

          {scanMode && (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="p-6 text-center">
                <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Mode scan activé - Utilisez la recherche ci-dessus pour scanner un QR code
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Guest List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Liste de Présence</CardTitle>
          <CardDescription>
            Suivez les arrivées en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Heure d'arrivée</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">{invitee.name}</TableCell>
                    <TableCell>{invitee.email}</TableCell>
                    <TableCell>
                      {invitee.is_checked_in ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Présent
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {invitee.checked_in_at ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatCheckInTime(invitee.checked_in_at)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!invitee.is_checked_in && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckIn(invitee.token, invitee.name)}
                          disabled={checkInMutation.isPending}
                          className="bg-success hover:bg-success/90"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Check-in
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInSystem;