import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Repeat, 
  Plus, 
  Edit, 
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter, isBefore, addDays, addWeeks, addMonths } from "date-fns";
import { fr } from "date-fns/locale";

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  maxOccurrences?: number;
}

interface EventSchedule {
  id: string;
  name: string;
  description: string;
  eventId?: string;
  startDate: Date;
  startTime: string;
  duration: number; // en minutes
  recurrence?: RecurrenceRule;
  status: 'active' | 'paused' | 'completed';
  nextOccurrence?: Date;
  totalOccurrences: number;
  maxOccurrences?: number;
  timezone: string;
  attendeeCount?: number;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdvancedEventSchedulerProps {
  eventId?: string;
}

const AdvancedEventScheduler = ({ eventId }: AdvancedEventSchedulerProps) => {
  const [schedules, setSchedules] = useState<EventSchedule[]>([
    {
      id: "1",
      name: "Réunion équipe hebdo",
      description: "Réunion d'équipe hebdomadaire tous les lundis",
      startDate: new Date(),
      startTime: "09:00",
      duration: 60,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Lundi
        maxOccurrences: 52
      },
      status: 'active',
      nextOccurrence: addWeeks(new Date(), 1),
      totalOccurrences: 5,
      maxOccurrences: 52,
      timezone: 'Europe/Paris',
      attendeeCount: 12,
      location: "Salle de réunion A",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar');
  
  const [newSchedule, setNewSchedule] = useState<Partial<EventSchedule>>({
    name: "",
    description: "",
    startDate: new Date(),
    startTime: "09:00",
    duration: 60,
    timezone: "Europe/Paris",
    status: 'active'
  });

  const getNextOccurrences = (schedule: EventSchedule, count: number = 5): Date[] => {
    const occurrences: Date[] = [];
    let currentDate = new Date(schedule.startDate);
    
    if (!schedule.recurrence) {
      return [currentDate];
    }

    const { frequency, interval, daysOfWeek, endDate, maxOccurrences } = schedule.recurrence;
    
    for (let i = 0; i < count && occurrences.length < count; i++) {
      if (endDate && isAfter(currentDate, endDate)) break;
      if (maxOccurrences && schedule.totalOccurrences >= maxOccurrences) break;
      
      occurrences.push(new Date(currentDate));
      
      switch (frequency) {
        case 'daily':
          currentDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          if (daysOfWeek && daysOfWeek.length > 0) {
            // Logic for specific days of week
            currentDate = addWeeks(currentDate, interval);
          } else {
            currentDate = addWeeks(currentDate, interval);
          }
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, interval);
          break;
        case 'yearly':
          currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + interval));
          break;
      }
    }
    
    return occurrences;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'paused': return 'text-warning';
      case 'completed': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            status: schedule.status === 'active' ? 'paused' : 'active',
            updatedAt: new Date()
          }
        : schedule
    ));
    toast.success("Statut de la programmation mis à jour");
  };

  const createSchedule = () => {
    if (!newSchedule.name || !newSchedule.startDate) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const schedule: EventSchedule = {
      id: Date.now().toString(),
      name: newSchedule.name,
      description: newSchedule.description || "",
      eventId: eventId,
      startDate: newSchedule.startDate,
      startTime: newSchedule.startTime || "09:00",
      duration: newSchedule.duration || 60,
      recurrence: newSchedule.recurrence,
      status: 'active',
      totalOccurrences: 0,
      timezone: newSchedule.timezone || "Europe/Paris",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (schedule.recurrence) {
      const nextOccurrences = getNextOccurrences(schedule, 1);
      schedule.nextOccurrence = nextOccurrences[0];
    }

    setSchedules(prev => [...prev, schedule]);
    setNewSchedule({
      name: "",
      description: "",
      startDate: new Date(),
      startTime: "09:00",
      duration: 60,
      timezone: "Europe/Paris",
      status: 'active'
    });
    setShowCreateDialog(false);
    toast.success("Programmation créée avec succès");
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast.success("Programmation supprimée");
  };

  // Calendar view component
  const CalendarView = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Calendrier des Événements</CardTitle>
            <CardDescription>
              Visualisez tous vos événements programmés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              locale={fr}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: fr }) : 'Sélectionnez une date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div className="space-y-3">
                {schedules
                  .filter(schedule => {
                    const occurrences = getNextOccurrences(schedule, 30);
                    return occurrences.some(date => 
                      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                    );
                  })
                  .map(schedule => (
                    <div key={schedule.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(schedule.status)}
                          <span className="font-medium text-sm">{schedule.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {schedule.startTime}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {schedule.duration} min • {schedule.location || "Lieu non défini"}
                      </p>
                    </div>
                  ))}
                  
                {schedules.filter(schedule => {
                  const occurrences = getNextOccurrences(schedule, 30);
                  return occurrences.some(date => 
                    format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  );
                }).length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Aucun événement ce jour
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // List view component
  const ListView = () => (
    <div className="space-y-4">
      {schedules.map(schedule => (
        <Card key={schedule.id} className="shadow-card hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1 rounded-full ${getStatusColor(schedule.status)}`}>
                    {getStatusIcon(schedule.status)}
                  </div>
                  <h3 className="font-semibold text-lg">{schedule.name}</h3>
                  <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                    {schedule.status === 'active' ? 'Actif' : 
                     schedule.status === 'paused' ? 'Pausé' : 'Terminé'}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-3">{schedule.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Début:</span>
                    <div className="font-medium">
                      {format(schedule.startDate, 'dd/MM/yyyy')} à {schedule.startTime}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Durée:</span>
                    <div className="font-medium">{schedule.duration} min</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Récurrence:</span>
                    <div className="font-medium">
                      {schedule.recurrence ? 
                        `${schedule.recurrence.frequency} (x${schedule.recurrence.interval})` : 
                        'Unique'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prochaine:</span>
                    <div className="font-medium">
                      {schedule.nextOccurrence ? 
                        format(schedule.nextOccurrence, 'dd/MM à HH:mm') : 
                        'Aucune'
                      }
                    </div>
                  </div>
                </div>

                {schedule.attendeeCount && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {schedule.attendeeCount} participants attendus
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleScheduleStatus(schedule.id)}
                >
                  {schedule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteSchedule(schedule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Programmation Avancée
          </h2>
          <p className="text-muted-foreground">
            Planifiez et gérez vos événements récurrents avec précision
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
            <TabsList>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Programmation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une Programmation</DialogTitle>
                <DialogDescription>
                  Configurez une nouvelle programmation d'événements
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Nom de la programmation *</Label>
                    <Input
                      id="name"
                      value={newSchedule.name || ""}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Réunion équipe hebdomadaire"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSchedule.description || ""}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de la programmation..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Date de début *</Label>
                    <Calendar
                      mode="single"
                      selected={newSchedule.startDate}
                      onSelect={(date) => setNewSchedule(prev => ({ ...prev, startDate: date }))}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="startTime">Heure de début</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newSchedule.startTime || "09:00"}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Durée (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        max="480"
                        value={newSchedule.duration || 60}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Lieu (optionnel)</Label>
                      <Input
                        id="location"
                        value={newSchedule.location || ""}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Salle de réunion, visioconférence..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createSchedule} className="bg-gradient-primary">
                    Créer la Programmation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'calendar' ? <CalendarView /> : <ListView />}
    </div>
  );
};

export default AdvancedEventScheduler;