import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Users, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEventTables, useCreateEventTable, useDeleteEventTable, type EventTable } from "@/hooks/useEventTables";
import { useInvitees } from "@/hooks/useInvitees";

interface TableManagementProps {
  eventId: string;
}

const TableManagement = ({ eventId }: TableManagementProps) => {
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTable, setNewTable] = useState({
    table_number: 1,
    table_name: "",
    max_seats: 8
  });

  const { toast } = useToast();
  const { data: tables = [], isLoading } = useEventTables(eventId);
  const { data: invitees = [] } = useInvitees(eventId);
  const createTableMutation = useCreateEventTable();
  const deleteTableMutation = useDeleteEventTable();

  const handleAddTable = async () => {
    if (!newTable.table_name) {
      toast({
        title: "Erreur",
        description: "Le nom de la table est obligatoire",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTableMutation.mutateAsync({
        event_id: eventId,
        table_number: newTable.table_number,
        table_name: newTable.table_name,
        max_seats: newTable.max_seats,
      });

      setNewTable({
        table_number: Math.max(...tables.map(t => t.table_number), 0) + 1,
        table_name: "",
        max_seats: 8
      });
      setIsAddingTable(false);
      
      toast({
        title: "Succès",
        description: "Table ajoutée avec succès !",
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la table",
        variant: "destructive",
      });
    }
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await deleteTableMutation.mutateAsync(tableToDelete.id);
      toast({
        title: "Succès",
        description: `Table "${tableToDelete.name}" supprimée`,
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la table",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setTableToDelete(null);
    }
  };

  const getGuestsForTable = (tableNumber: number) => {
    return invitees.filter(invitee => invitee.table_number === tableNumber);
  };

  const stats = {
    totalTables: tables.length,
    totalSeats: tables.reduce((sum, table) => sum + table.max_seats, 0),
    occupiedSeats: tables.reduce((sum, table) => sum + table.current_seats, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{stats.totalTables}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Places Total</p>
                <p className="text-2xl font-bold">{stats.totalSeats}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupées</p>
                <p className="text-2xl font-bold text-success">{stats.occupiedSeats}</p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Management */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestion des Tables</CardTitle>
              <CardDescription>
                Organisez la disposition des tables et l'attribution des places
              </CardDescription>
            </div>
            <Dialog open={isAddingTable} onOpenChange={setIsAddingTable}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Table</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle table à votre événement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="table_number">Numéro de Table</Label>
                    <Input
                      id="table_number"
                      type="number"
                      value={newTable.table_number}
                      onChange={(e) => setNewTable(prev => ({ ...prev, table_number: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table_name">Nom de la Table *</Label>
                    <Input
                      id="table_name"
                      value={newTable.table_name}
                      onChange={(e) => setNewTable(prev => ({ ...prev, table_name: e.target.value }))}
                      placeholder="Table des Amis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_seats">Nombre de Places</Label>
                    <Input
                      id="max_seats"
                      type="number"
                      value={newTable.max_seats}
                      onChange={(e) => setNewTable(prev => ({ ...prev, max_seats: parseInt(e.target.value) || 8 }))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddTable} 
                      className="flex-1"
                      disabled={createTableMutation.isPending}
                    >
                      {createTableMutation.isPending ? "Ajout..." : "Ajouter"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingTable(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Chargement des tables...</div>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune table créée pour le moment</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Places</TableHead>
                    <TableHead>Occupées</TableHead>
                    <TableHead>Invités</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => {
                    const tableGuests = getGuestsForTable(table.table_number);
                    return (
                      <TableRow key={table.id}>
                        <TableCell>
                          <Badge variant="outline">#{table.table_number}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{table.table_name}</TableCell>
                        <TableCell>{table.max_seats}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={table.current_seats >= table.max_seats ? "destructive" : "secondary"}
                          >
                            {table.current_seats}/{table.max_seats}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {tableGuests.length > 0 ? (
                              <div className="space-y-1">
                                {tableGuests.slice(0, 3).map(guest => (
                                  <div key={guest.id}>{guest.name}</div>
                                ))}
                                {tableGuests.length > 3 && (
                                  <div className="text-xs">+{tableGuests.length - 3} autres</div>
                                )}
                              </div>
                            ) : (
                              "Aucun invité assigné"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => {
                                setTableToDelete({ id: table.id, name: table.table_name });
                                setDeleteConfirmOpen(true);
                              }}
                              disabled={deleteTableMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la table <strong>"{tableToDelete?.name}"</strong> ? 
              Cette action est irréversible et tous les invités assignés à cette table seront désassignés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTable}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteTableMutation.isPending}
            >
              {deleteTableMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TableManagement;