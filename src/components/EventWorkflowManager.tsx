import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Zap, 
  Play, 
  Pause, 
  Plus, 
  Clock, 
  Mail, 
  MessageCircle, 
  Smartphone,
  Calendar,
  Users,
  Settings,
  Trash2,
  Edit,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowAction {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'telegram' | 'delay';
  config: {
    template?: string;
    delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
    recipients?: 'all' | 'confirmed' | 'pending' | 'declined';
    message?: string;
  };
}

interface EventWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'scheduled' | 'conditional';
  trigger_conditions: any;
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'completed';
  execution_count: number;
  last_executed_at?: string;
}

interface EventWorkflowManagerProps {
  eventId: string;
}

const EventWorkflowManager = ({ eventId }: EventWorkflowManagerProps) => {
  const [workflows, setWorkflows] = useState<EventWorkflow[]>([
    {
      id: '1',
      name: 'Séquence d\'invitation automatique',
      description: 'Envoie automatiquement les invitations et rappels',
      trigger_type: 'scheduled',
      trigger_conditions: { schedule: '7 days before event' },
      actions: [
        {
          id: '1',
          type: 'email',
          config: { template: 'invitation', recipients: 'all' }
        },
        {
          id: '2', 
          type: 'delay',
          config: { delay: { value: 3, unit: 'days' } }
        },
        {
          id: '3',
          type: 'email',
          config: { template: 'reminder', recipients: 'pending' }
        }
      ],
      status: 'active',
      execution_count: 12,
      last_executed_at: '2024-01-15T10:30:00Z'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<EventWorkflow | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as const,
    trigger_conditions: {},
    actions: [] as WorkflowAction[]
  });

  const triggerTypes = [
    { value: 'manual', label: 'Manuel', description: 'Déclencher manuellement' },
    { value: 'scheduled', label: 'Programmé', description: 'À une date/heure précise' },
    { value: 'conditional', label: 'Conditionnel', description: 'Basé sur des conditions' }
  ];

  const actionTypes = [
    { value: 'email', label: 'Email', icon: Mail, description: 'Envoyer un email' },
    { value: 'sms', label: 'SMS', icon: Smartphone, description: 'Envoyer un SMS' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Message WhatsApp' },
    { value: 'telegram', label: 'Telegram', icon: MessageCircle, description: 'Message Telegram' },
    { value: 'delay', label: 'Délai', icon: Clock, description: 'Attendre un délai' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type);
    return actionType?.icon || Settings;
  };

  const handleCreateWorkflow = async () => {
    try {
      const workflow: EventWorkflow = {
        id: Date.now().toString(),
        ...newWorkflow,
        status: 'active',
        execution_count: 0
      };

      setWorkflows(prev => [...prev, workflow]);
      setNewWorkflow({
        name: '',
        description: '',
        trigger_type: 'manual',
        trigger_conditions: {},
        actions: []
      });
      setIsCreateDialogOpen(false);
      
      toast.success('Workflow créé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la création du workflow');
    }
  };

  const handleToggleWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
    toast.success('Statut du workflow mis à jour');
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { 
              ...w, 
              execution_count: w.execution_count + 1,
              last_executed_at: new Date().toISOString()
            }
          : w
      ));
      
      toast.success('Workflow exécuté avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'exécution du workflow');
    }
  };

  const addActionToWorkflow = (actionType: string) => {
    const newAction: WorkflowAction = {
      id: Date.now().toString(),
      type: actionType as any,
      config: {}
    };

    setNewWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  };

  const removeActionFromWorkflow = (actionId: string) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== actionId)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            Workflows d'Automatisation
          </h2>
          <p className="text-muted-foreground">
            Créez des séquences automatisées pour vos invitations et rappels
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {workflow.name}
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status === 'active' ? 'Actif' : 
                       workflow.status === 'paused' ? 'En pause' : 'Terminé'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{workflow.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Déclencheur: {triggerTypes.find(t => t.value === workflow.trigger_type)?.label}</span>
                    <span>Exécutions: {workflow.execution_count}</span>
                    {workflow.last_executed_at && (
                      <span>Dernière exécution: {new Date(workflow.last_executed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleWorkflow(workflow.id)}
                  >
                    {workflow.status === 'active' ? 
                      <><Pause className="w-4 h-4 mr-1" /> Pause</> :
                      <><Play className="w-4 h-4 mr-1" /> Activer</>
                    }
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExecuteWorkflow(workflow.id)}
                    disabled={workflow.status !== 'active'}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Exécuter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">Actions du workflow:</h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {workflow.actions.map((action, index) => {
                    const IconComponent = getActionIcon(action.type);
                    return (
                      <div key={action.id} className="flex items-center gap-2 min-w-fit">
                        <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {actionTypes.find(at => at.value === action.type)?.label}
                          </span>
                          {action.config.delay && (
                            <span className="text-xs text-muted-foreground">
                              ({action.config.delay.value} {action.config.delay.unit})
                            </span>
                          )}
                        </div>
                        {index < workflow.actions.length - 1 && (
                          <div className="text-muted-foreground">→</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Workflow Dialog */}
      {isCreateDialogOpen && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Créer un nouveau workflow</CardTitle>
            <CardDescription>
              Configurez une séquence d'actions automatisées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Nom du workflow</Label>
                <Input
                  id="workflow-name"
                  placeholder="ex: Séquence d'invitation"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger-type">Type de déclencheur</Label>
                <Select 
                  value={newWorkflow.trigger_type} 
                  onValueChange={(value: any) => setNewWorkflow(prev => ({ ...prev, trigger_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((type) => (
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

            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                placeholder="Décrivez ce que fait ce workflow..."
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Actions du workflow</Label>
                <Select onValueChange={addActionToWorkflow}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ajouter une action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {newWorkflow.actions.length > 0 && (
                <div className="space-y-2">
                  {newWorkflow.actions.map((action, index) => {
                    const IconComponent = getActionIcon(action.type);
                    return (
                      <div key={action.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <IconComponent className="w-4 h-4" />
                        <span className="flex-1">
                          {actionTypes.find(at => at.value === action.type)?.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeActionFromWorkflow(action.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateWorkflow}
                className="bg-gradient-primary"
                disabled={!newWorkflow.name || newWorkflow.actions.length === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Créer le workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventWorkflowManager;