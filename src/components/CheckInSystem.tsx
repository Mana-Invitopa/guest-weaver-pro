import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Search, UserCheck, Clock, Users, Camera, Table as TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInvitees, useCheckInInvitee } from "@/hooks/useInvitees";
import QRScanner from "./QRScanner";

interface CheckInSystemProps {
  eventId: string;
}

const CheckInSystem = ({ eventId }: CheckInSystemProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
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

  const handleCheckIn = async (token: string, guestName: string, tableInfo?: { number: number, name: string }) => {
    try {
      await checkInMutation.mutateAsync(token);
      
      const tableText = tableInfo ? ` (Table ${tableInfo.number} - ${tableInfo.name})` : '';
      
      toast({
        title: "Check-in réussi !",
        description: `${guestName} a été enregistré comme présent${tableText}`,
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
        const tableInfo = invitee.table_number && invitee.table_name ? 
          { number: invitee.table_number, name: invitee.table_name } : undefined;
        handleCheckIn(invitee.token, invitee.name, tableInfo);
        setSearchTerm(""); // Clear search after auto check-in
      }
    }
  };

  const handleQRScanSuccess = (scannedData: string) => {
    // Extract token from scanned data (assuming it's a URL with token)
    const tokenMatch = scannedData.match(/invitation\/([a-f0-9]+)/i);
    const token = tokenMatch ? tokenMatch[1] : scannedData;
    
    const invitee = invitees.find(i => i.token === token);
    if (invitee && !invitee.is_checked_in) {
      const tableInfo = invitee.table_number && invitee.table_name ? 
        { number: invitee.table_number, name: invitee.table_name } : undefined;
      handleCheckIn(invitee.token, invitee.name, tableInfo);
      setShowScanner(false);
    } else if (invitee?.is_checked_in) {
      toast({
        title: "Déjà enregistré",
        description: `${invitee.name} est déjà enregistré comme présent`,
        variant: "destructive",
      });
      setShowScanner(false);
    } else {
      toast({
        title: "QR Code invalide",
        description: "Ce QR code ne correspond à aucun invité",
        variant: "destructive",
      });
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
              variant={showScanner ? "default" : "outline"}
              onClick={() => setShowScanner(!showScanner)}
            >
              <Camera className="w-4 h-4 mr-2" />
              {showScanner ? "Fermer Scanner" : "Scanner QR"}
            </Button>
          </div>

          <QRScanner 
            isActive={showScanner}
            onScanSuccess={handleQRScanSuccess}
            onClose={() => setShowScanner(false)}
          />
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
                    <TableHead>Table</TableHead>
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
                      {invitee.table_number ? (
                        <div className="flex items-center gap-1">
                          <TableIcon className="w-3 h-3 text-accent" />
                          <span className="text-sm">
                            {invitee.table_number} - {invitee.table_name || 'Sans nom'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non assignée</span>
                      )}
                    </TableCell>
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
                          onClick={() => {
                            const tableInfo = invitee.table_number && invitee.table_name ? 
                              { number: invitee.table_number, name: invitee.table_name } : undefined;
                            handleCheckIn(invitee.token, invitee.name, tableInfo);
                          }}
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