import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Clock, MessageSquare, Phone, Zap, Plus, Play, Pause, Trash2, Copy, BarChart3, Filter, Grid3x3, Download, Upload, Sparkles } from "lucide-react";
import {
  useEventWorkflows, useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow,
  useToggleWorkflow, WorkflowAction, EventWorkflow,
} from "@/hooks/useWorkflowsCRUD";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { workflowTemplates, WorkflowTemplate } from "@/data/workflowTemplates";
import { WorkflowVisualEditor } from "./WorkflowVisualEditor";
import { WorkflowAnalytics } from "./WorkflowAnalytics";
import { WorkflowConditionsEditor } from "./WorkflowConditionsEditor";

interface EventWorkflowManagerProps {
  eventId: string;
}

const EventWorkflowManager = ({ eventId }: EventWorkflowManagerProps) => {
  const { data: workflows = [], isLoading } = useEventWorkflows(eventId);
  const createWorkflow = useCreateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const toggleWorkflow = useToggleWorkflow();
  const executeWorkflow = useWorkflowExecution();

  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("templates");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<{
    name: string; description: string; 
    trigger_type: "manual" | "scheduled" | "conditional";
    actions: WorkflowAction[]; conditions: any[];
  }>({
    name: "", description: "", trigger_type: "manual",
    actions: [], conditions: [],
  });

  const handleCreateWorkflow = () => {
    createWorkflow.mutate({
      event_id: eventId, name: newWorkflow.name, description: newWorkflow.description,
      trigger_type: newWorkflow.trigger_type, trigger_conditions: { conditions: newWorkflow.conditions },
      actions: newWorkflow.actions, status: "active",
    });
    setShowNewWorkflow(false);
    setNewWorkflow({ name: "", description: "", trigger_type: "manual", actions: [], conditions: [] });
  };

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    setNewWorkflow({
      name: template.name, description: template.description, trigger_type: template.trigger_type,
      actions: template.actions, conditions: [],
    });
    setActiveTab("workflows");
    setShowNewWorkflow(true);
  };

  const handleDuplicateWorkflow = (workflow: EventWorkflow) => {
    setNewWorkflow({
      name: `${workflow.name} (Copie)`, description: workflow.description || "",
      trigger_type: workflow.trigger_type, actions: workflow.actions,
      conditions: (workflow.trigger_conditions as any)?.conditions || [],
    });
    setShowNewWorkflow(true);
  };

  const handleExportWorkflow = (workflow: EventWorkflow) => {
    const exportData = {
      name: workflow.name,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      trigger_conditions: workflow.trigger_conditions,
      actions: workflow.actions,
      status: workflow.status,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportWorkflow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedWorkflow = JSON.parse(text);
        
        setNewWorkflow({
          name: importedWorkflow.name + ' (importé)',
          description: importedWorkflow.description || '',
          trigger_type: importedWorkflow.trigger_type || 'manual',
          actions: importedWorkflow.actions || [],
          conditions: (importedWorkflow.trigger_conditions as any)?.conditions || []
        });
        
        setActiveTab('workflows');
        setShowNewWorkflow(true);
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    
    input.click();
  };

  const filteredTemplates = selectedCategory === "all" ? workflowTemplates : workflowTemplates.filter((t) => t.category === selectedCategory);
  const categories = [
    { value: "all", label: "Tous" }, { value: "invitation", label: "Invitations" },
    { value: "reminder", label: "Rappels" }, { value: "followup", label: "Suivi" },
  ];

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workflows</h2>
          <p className="text-muted-foreground">Automatisez vos communications et processus</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportWorkflow}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showAnalytics ? "Masquer" : "Analytics"}
          </Button>
          <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau Workflow</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Créer un Workflow</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Nom du workflow</Label><Input value={newWorkflow.name} onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })} placeholder="Ex: Séquence d'invitation complète" /></div>
                <div><Label>Description</Label><Textarea value={newWorkflow.description} onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })} placeholder="Décrivez l'objectif de ce workflow" rows={3} /></div>
                <div><Label>Type de déclencheur</Label><Select value={newWorkflow.trigger_type} onValueChange={(value: any) => setNewWorkflow({ ...newWorkflow, trigger_type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">Manuel</SelectItem><SelectItem value="scheduled">Planifié</SelectItem><SelectItem value="conditional">Conditionnel</SelectItem></SelectContent></Select></div>
                {newWorkflow.trigger_type === "conditional" && (<WorkflowConditionsEditor conditions={newWorkflow.conditions} onChange={(conditions) => setNewWorkflow({ ...newWorkflow, conditions })} />)}
                <WorkflowVisualEditor actions={newWorkflow.actions} onChange={(actions) => setNewWorkflow({ ...newWorkflow, actions })} eventId={eventId} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>Annuler</Button>
                <Button onClick={handleCreateWorkflow} disabled={!newWorkflow.name || newWorkflow.actions.length === 0}>Créer le Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showAnalytics && workflows && <WorkflowAnalytics workflows={workflows} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates"><Sparkles className="h-4 w-4 mr-2" />Templates</TabsTrigger>
          <TabsTrigger value="workflows"><Zap className="h-4 w-4 mr-2" />Mes Workflows ({workflows?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">{categories.map((cat) => (<Button key={cat.value} size="sm" variant={selectedCategory === cat.value ? "default" : "outline"} onClick={() => setSelectedCategory(cat.value)}>{cat.label}</Button>))}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">{template.icon}<CardTitle className="text-base">{template.name}</CardTitle></div>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /><span>{template.actions.length} actions</span></div></div>
                  <Button className="w-full" size="sm" onClick={() => handleApplyTemplate(template)}>Utiliser ce template</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.length === 0 ? (
            <Card><CardContent className="p-12 text-center"><Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="text-lg font-semibold mb-2">Aucun workflow créé</h3><p className="text-muted-foreground mb-4">Commencez par créer un workflow ou utilisez un template</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2"><CardTitle className="text-lg">{workflow.name}</CardTitle><Badge variant={workflow.status === "active" ? "default" : workflow.status === "paused" ? "secondary" : "outline"}>{workflow.status}</Badge></div>
                        {workflow.description && <CardDescription>{workflow.description}</CardDescription>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => executeWorkflow.mutate({ workflowId: workflow.id, eventId })} disabled={executeWorkflow.isPending} title="Exécuter"><Play className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleWorkflow.mutate({ id: workflow.id, eventId, currentStatus: workflow.status })} title={workflow.status === "active" ? "Mettre en pause" : "Activer"}>{workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateWorkflow(workflow)} title="Dupliquer"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleExportWorkflow(workflow)} title="Exporter"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteWorkflow.mutate({ id: workflow.id, eventId })} title="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><div className="text-muted-foreground">Type</div><div className="font-medium capitalize">{workflow.trigger_type}</div></div>
                      <div><div className="text-muted-foreground">Actions</div><div className="font-medium">{workflow.actions.length}</div></div>
                      <div><div className="text-muted-foreground">Exécutions</div><div className="font-medium">{workflow.execution_count || 0}</div></div>
                      <div><div className="text-muted-foreground">Dernière exécution</div><div className="font-medium">{workflow.last_executed_at ? format(new Date(workflow.last_executed_at), "dd/MM/yyyy", { locale: fr }) : "Jamais"}</div></div>
                    </div>
                    {workflow.actions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Aperçu des actions:</div>
                        <div className="flex flex-wrap gap-2">
                          {workflow.actions.map((action, index) => (
                            <Badge key={action.id} variant="outline" className="gap-1">{index + 1}.{action.type === "email" && <Mail className="h-3 w-3" />}{action.type === "sms" && <MessageSquare className="h-3 w-3" />}{action.type === "whatsapp" && <MessageSquare className="h-3 w-3" />}{action.type === "telegram" && <MessageSquare className="h-3 w-3" />}{action.type === "delay" && <Clock className="h-3 w-3" />}<span className="capitalize">{action.type}</span></Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventWorkflowManager;
