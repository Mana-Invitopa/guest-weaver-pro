import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Clock, MapPin, MoveUp, MoveDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import SendProgramButton from "./SendProgramButton";

interface EventProgram {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  display_order: number;
}

interface EventProgramManagerProps {
  eventId: string;
}

export default function EventProgramManager({ eventId }: EventProgramManagerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<EventProgram | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
  });

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['event-programs', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_programs')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as EventProgram[];
    },
    enabled: !!eventId,
  });

  const createProgram = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = programs.length > 0 ? Math.max(...programs.map(p => p.display_order)) : -1;
      
      const { error } = await supabase
        .from('event_programs')
        .insert({
          event_id: eventId,
          ...data,
          display_order: maxOrder + 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-programs', eventId] });
      toast.success("Programme ajouté avec succès");
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout: " + error.message);
    },
  });

  const updateProgram = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('event_programs')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-programs', eventId] });
      toast.success("Programme mis à jour avec succès");
      setIsOpen(false);
      setEditingProgram(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  const deleteProgram = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('event_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-programs', eventId] });
      toast.success("Programme supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const reorderProgram = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('event_programs')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-programs', eventId] });
    },
  });

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const current = programs[index];
    const previous = programs[index - 1];
    
    reorderProgram.mutate({ id: current.id, newOrder: previous.display_order });
    reorderProgram.mutate({ id: previous.id, newOrder: current.display_order });
  };

  const handleMoveDown = (index: number) => {
    if (index === programs.length - 1) return;
    const current = programs[index];
    const next = programs[index + 1];
    
    reorderProgram.mutate({ id: current.id, newOrder: next.display_order });
    reorderProgram.mutate({ id: next.id, newOrder: current.display_order });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
    });
  };

  const handleEdit = (program: EventProgram) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description || "",
      start_time: program.start_time,
      end_time: program.end_time,
      location: program.location || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (editingProgram) {
      updateProgram.mutate({ id: editingProgram.id, data: formData });
    } else {
      createProgram.mutate(formData);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Programme de l'événement</CardTitle>
              <CardDescription>Créez et gérez le programme détaillé de votre événement</CardDescription>
            </div>
            <div className="flex gap-2">
              <SendProgramButton eventId={eventId} />
              <Button onClick={() => { resetForm(); setEditingProgram(null); setIsOpen(true); }} className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun programme défini pour cet événement</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program, index) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === programs.length - 1}
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{program.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {format(new Date(program.start_time), 'HH:mm')} - {format(new Date(program.end_time), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {program.location && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {program.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteProgram.mutate(program.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Modifier' : 'Ajouter'} un programme</DialogTitle>
            <DialogDescription>Définissez les détails de cette activité du programme</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Discours d'ouverture"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'activité"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Heure de début *</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Heure de fin *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Salle principale, Terrasse"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsOpen(false); setEditingProgram(null); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.start_time || !formData.end_time}>
              {editingProgram ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
