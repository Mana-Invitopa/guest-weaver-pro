import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Repeat, 
  Plus, 
  Trash2,
  Save,
  Play,
  Pause,
  Settings,
  AlertCircle
} from "lucide-react";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: Date;
  occurrences?: number;
}

interface EventSchedule {
  id: string;
  name: string;
  schedule_type: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  recurrence_pattern: RecurrenceRule;
  start_date: Date;
  end_date?: Date;
  next_occurrence_date?: Date;
  created_occurrences: number;
  max_occurrences?: number;
  timezone: string;
  status: 'active' | 'paused' | 'completed';
}

interface EventSchedulerProps {
  eventId: string;
}

const EventScheduler = ({ eventId }: EventSchedulerProps) => {
  const [schedules, setSchedules] = useState<EventSchedule[]>([
    {
      id: '1',
      name: 'Réunion hebdomadaire équipe',
      schedule_type: 'weekly',
      recurrence_pattern: {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Lundi
      },
      start_date: new Date(),
      next_occurrence_date: addWeeks(new Date(), 1),
      created_occurrences: 8,
      max_occurrences: 52,
      timezone: 'Europe/Paris',
      status: 'active'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<EventSchedule>>({
    name: '',
    schedule_type: 'weekly',
    recurrence_pattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1]
    },
    start_date: new Date(),
    timezone: 'Europe/Paris',
    status: 'active'
  });

  const scheduleTypes = [
    { value: 'single', label: 'Unique', description: 'Événement ponctuel' },
    { value: 'daily', label: 'Quotidien', description: 'Tous les jours' },
    { value: 'weekly', label: 'Hebdomadaire', description: 'Chaque semaine' },
    { value: 'monthly', label: 'Mensuel', description: 'Chaque mois' },
    { value: 'yearly', label: 'Annuel', description: 'Chaque année' },
    { value: 'custom', label: 'Personnalisé', description: 'Règle personnalisée' }
  ];

  const daysOfWeek = [
    { value: 1, label: 'Lun', full: 'Lundi' },
    { value: 2, label: 'Mar', full: 'Mardi' },
    { value: 3, label: 'Mer', full: 'Mercredi' },
    { value: 4, label: 'Jeu', full: 'Jeudi' },
    { value: 5, label: 'Ven', full: 'Vendredi' },
    { value: 6, label: 'Sam', full: 'Samedi' },
    { value: 0, label: 'Dim', full: 'Dimanche' }
  ];

  const getSchedulePreview = (schedule: EventSchedule) => {
    const { recurrence_pattern, start_date } = schedule;
    
    if (schedule.schedule_type === 'single') {
      return `Le ${format(start_date, 'dd MMMM yyyy', { locale: fr })}`;
    }
    
    let preview = `Tous les `;
    
    if (recurrence_pattern.interval > 1) {
      preview += `${recurrence_pattern.interval} `;
    }
    
    switch (recurrence_pattern.frequency) {
      case 'daily':
        preview += recurrence_pattern.interval > 1 ? 'jours' : 'jour';
        break;
      case 'weekly':
        preview += recurrence_pattern.interval > 1 ? 'semaines' : 'semaine';
        if (recurrence_pattern.daysOfWeek && recurrence_pattern.daysOfWeek.length > 0) {
          const dayNames = recurrence_pattern.daysOfWeek
            .map(day => daysOfWeek.find(d => d.value === day)?.label)
            .join(', ');
          preview += ` (${dayNames})`;
        }
        break;
      case 'monthly':
        preview += recurrence_pattern.interval > 1 ? 'mois' : 'mois';
        break;
      case 'yearly':
        preview += recurrence_pattern.interval > 1 ? 'ans' : 'an';
        break;
    }
    
    return preview;
  };

  const getNextOccurrences = (schedule: EventSchedule, count: number = 3) => {
    const occurrences: Date[] = [];
    let currentDate = new Date(schedule.start_date);
    
    for (let i = 0; i < count; i++) {
      switch (schedule.recurrence_pattern.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, schedule.recurrence_pattern.interval);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, schedule.recurrence_pattern.interval);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, schedule.recurrence_pattern.interval);
          break;
        case 'yearly':
          currentDate = addYears(currentDate, schedule.recurrence_pattern.interval);
          break;
      }
      occurrences.push(new Date(currentDate));
    }
    
    return occurrences;
  };

  const handleCreateSchedule = async () => {
    try {
      const schedule: EventSchedule = {
        id: Date.now().toString(),
        name: newSchedule.name || 'Nouvel événement programmé',
        schedule_type: newSchedule.schedule_type || 'weekly',
        recurrence_pattern: newSchedule.recurrence_pattern!,
        start_date: newSchedule.start_date || new Date(),
        end_date: newSchedule.end_date,
        created_occurrences: 0,
        max_occurrences: newSchedule.max_occurrences,
        timezone: newSchedule.timezone || 'Europe/Paris',
        status: 'active'
      };

      setSchedules(prev => [...prev, schedule]);
      setNewSchedule({
        name: '',
        schedule_type: 'weekly',
        recurrence_pattern: {
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [1]
        },
        start_date: new Date(),
        timezone: 'Europe/Paris',
        status: 'active'
      });
      setIsCreating(false);
      
      toast.success('Programme d\'événement créé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création du programme');
    }
  };

  const handleToggleSchedule = async (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId 
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ));
    toast.success('Statut du programme mis à jour');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const updateRecurrencePattern = (field: keyof RecurrenceRule, value: any) => {
    setNewSchedule(prev => ({
      ...prev,
      recurrence_pattern: {
        ...prev.recurrence_pattern!,
        [field]: value
      }
    }));
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = newSchedule.recurrence_pattern?.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    updateRecurrencePattern('daysOfWeek', newDays);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent" />
            Programmation d'Événements
          </h2>
          <p className="text-muted-foreground">
            Créez des événements récurrents et gérez leur programmation
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Programme
        </Button>
      </div>

      {/* Schedules List */}
      <div className="grid gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="shadow-card">
            <CardHeader>
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                <div className="space-y-2 flex-1">
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    {schedule.name}
                    <Badge className={getStatusColor(schedule.status)}>
                      {schedule.status === 'active' ? 'Actif' : 
                       schedule.status === 'paused' ? 'En pause' : 'Terminé'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{getSchedulePreview(schedule)}</CardDescription>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>Début: {format(schedule.start_date, 'dd/MM/yyyy', { locale: fr })}</span>
                    <span>Occurrences: {schedule.created_occurrences}</span>
                    {schedule.max_occurrences && (
                      <span>Max: {schedule.max_occurrences}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleSchedule(schedule.id)}
                  >
                    {schedule.status === 'active' ? 
                      <><Pause className="w-4 h-4 mr-1" /> Pause</> :
                      <><Play className="w-4 h-4 mr-1" /> Activer</>
                    }
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Prochaines occurrences</h4>
                  <div className="space-y-1">
                    {getNextOccurrences(schedule).map((date, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {format(date, 'EEEE dd MMMM yyyy', { locale: fr })}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Fréquence: {scheduleTypes.find(t => t.value === schedule.schedule_type)?.label}</div>
                    <div>Fuseau horaire: {schedule.timezone}</div>
                    {schedule.end_date && (
                      <div>Fin: {format(schedule.end_date, 'dd/MM/yyyy', { locale: fr })}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Schedule Form */}
      {isCreating && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Créer un nouveau programme</CardTitle>
            <CardDescription>
              Configurez la récurrence de votre événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-name">Nom du programme</Label>
                <Input
                  id="schedule-name"
                  placeholder="ex: Réunion hebdomadaire"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-type">Type de récurrence</Label>
                <Select 
                  value={newSchedule.schedule_type} 
                  onValueChange={(value: any) => setNewSchedule(prev => ({ ...prev, schedule_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSchedule.start_date ? 
                        format(newSchedule.start_date, "dd MMMM yyyy", { locale: fr }) : 
                        "Sélectionner une date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSchedule.start_date}
                      onSelect={(date) => date && setNewSchedule(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalle</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  value={newSchedule.recurrence_pattern?.interval || 1}
                  onChange={(e) => updateRecurrencePattern('interval', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {newSchedule.schedule_type === 'weekly' && (
              <div className="space-y-3">
                <Label>Jours de la semaine</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      variant={newSchedule.recurrence_pattern?.daysOfWeek?.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDayOfWeek(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-occurrences">Nombre maximum d'occurrences</Label>
                <Input
                  id="max-occurrences"
                  type="number"
                  min="1"
                  placeholder="Illimité"
                  value={newSchedule.max_occurrences || ''}
                  onChange={(e) => setNewSchedule(prev => ({ 
                    ...prev, 
                    max_occurrences: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin (optionnel)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newSchedule.end_date ? 
                        format(newSchedule.end_date, "dd MMMM yyyy", { locale: fr }) : 
                        "Aucune date de fin"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newSchedule.end_date}
                      onSelect={(date) => setNewSchedule(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Preview */}
            {newSchedule.name && (
              <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Aperçu du programme
                </h4>
                <p className="text-sm text-muted-foreground">
                  <strong>{newSchedule.name}</strong> - {getSchedulePreview({
                    ...newSchedule,
                    id: 'preview',
                    created_occurrences: 0,
                    timezone: 'Europe/Paris',
                    status: 'active'
                  } as EventSchedule)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateSchedule}
                className="bg-gradient-primary"
                disabled={!newSchedule.name}
              >
                <Save className="w-4 h-4 mr-2" />
                Créer le programme
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventScheduler;