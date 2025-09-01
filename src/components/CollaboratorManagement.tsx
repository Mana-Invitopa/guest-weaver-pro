import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Settings, 
  Shield, 
  Mail,
  Eye,
  Edit,
  BarChart3
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  useEventCollaborators, 
  useAddCollaborator, 
  useRemoveCollaborator,
  useUpdateCollaboratorPermissions,
  EventCollaborator
} from "@/hooks/useEventCollaborators";

interface CollaboratorManagementProps {
  eventId: string;
}

const CollaboratorManagement = ({ eventId }: CollaboratorManagementProps) => {
  const [email, setEmail] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<EventCollaborator | null>(null);
  
  const { data: collaborators, isLoading } = useEventCollaborators(eventId);
  const addCollaboratorMutation = useAddCollaborator();
  const removeCollaboratorMutation = useRemoveCollaborator();
  const updatePermissionsMutation = useUpdateCollaboratorPermissions();

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    try {
      await addCollaboratorMutation.mutateAsync({
        event_id: eventId,
        user_email: email.trim(),
        role: 'collaborator',
        permissions: {
          manage_guests: true,
          manage_tables: true,
          view_analytics: true
        }
      });
      
      setEmail("");
      setShowAddDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    await removeCollaboratorMutation.mutateAsync(collaboratorId);
  };

  const handleUpdatePermissions = async (
    collaboratorId: string, 
    permissions: EventCollaborator['permissions']
  ) => {
    await updatePermissionsMutation.mutateAsync({
      collaboratorId,
      permissions
    });
    setEditingCollaborator(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des collaborateurs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Collaborateurs ({collaborators?.length || 0}/3)
            </CardTitle>
            
            {(collaborators?.length || 0) < 3 && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un collaborateur</DialogTitle>
                    <DialogDescription>
                      Invitez une personne à collaborer à la gestion de cet événement.
                      Elle doit avoir un compte sur la plateforme.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddCollaborator} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="collaborator-email">Email du collaborateur</Label>
                      <Input
                        id="collaborator-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddDialog(false)}
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={addCollaboratorMutation.isPending}
                        className="bg-gradient-primary"
                      >
                        {addCollaboratorMutation.isPending ? "Ajout..." : "Ajouter"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {!collaborators?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun collaborateur pour le moment</p>
              <p className="text-sm">
                Vous pouvez ajouter jusqu'à 3 collaborateurs pour vous aider à gérer cet événement
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div 
                  key={collaborator.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent-foreground" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {collaborator.profiles?.full_name || "Utilisateur"}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {collaborator.role === 'admin' ? 'Administrateur' : 'Collaborateur'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {collaborator.profiles?.email}
                      </div>
                      
                      {/* Permissions display */}
                      <div className="flex gap-2 mt-2">
                        {collaborator.permissions?.manage_guests && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Invités
                          </Badge>
                        )}
                        {collaborator.permissions?.manage_tables && (
                          <Badge variant="outline" className="text-xs">
                            <Edit className="w-3 h-3 mr-1" />
                            Tables
                          </Badge>
                        )}
                        {collaborator.permissions?.view_analytics && (
                          <Badge variant="outline" className="text-xs">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Analytics
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Edit permissions dialog */}
                    <Dialog 
                      open={editingCollaborator?.id === collaborator.id} 
                      onOpenChange={(open) => setEditingCollaborator(open ? collaborator : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier les permissions</DialogTitle>
                          <DialogDescription>
                            Définissez les permissions pour {collaborator.profiles?.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {editingCollaborator && (
                          <PermissionsEditor
                            collaborator={editingCollaborator}
                            onSave={(permissions) => 
                              handleUpdatePermissions(collaborator.id, permissions)
                            }
                            onCancel={() => setEditingCollaborator(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {/* Remove collaborator */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le collaborateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {collaborator.profiles?.full_name} 
                            de la liste des collaborateurs ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Permissions editor component
interface PermissionsEditorProps {
  collaborator: EventCollaborator;
  onSave: (permissions: EventCollaborator['permissions']) => void;
  onCancel: () => void;
}

const PermissionsEditor = ({ collaborator, onSave, onCancel }: PermissionsEditorProps) => {
  const [permissions, setPermissions] = useState(collaborator.permissions || {});

  const handlePermissionChange = (key: keyof EventCollaborator['permissions'], checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="manage_guests"
            checked={permissions.manage_guests || false}
            onCheckedChange={(checked) => 
              handlePermissionChange('manage_guests', checked as boolean)
            }
          />
          <Label htmlFor="manage_guests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gérer les invités
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="manage_tables"
            checked={permissions.manage_tables || false}
            onCheckedChange={(checked) => 
              handlePermissionChange('manage_tables', checked as boolean)
            }
          />
          <Label htmlFor="manage_tables" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Gérer les tables
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="view_analytics"
            checked={permissions.view_analytics || false}
            onCheckedChange={(checked) => 
              handlePermissionChange('view_analytics', checked as boolean)
            }
          />
          <Label htmlFor="view_analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Voir les analytics
          </Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={() => onSave(permissions)} className="bg-gradient-primary">
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default CollaboratorManagement;