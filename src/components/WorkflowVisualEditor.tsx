import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Mail, MessageSquare, Clock, Plus, Trash2, Copy, Eye } from "lucide-react";
import { WorkflowAction } from "@/hooks/useWorkflowsCRUD";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WorkflowVisualEditorProps {
  actions: WorkflowAction[];
  onChange: (actions: WorkflowAction[]) => void;
  eventId?: string;
}

interface SortableActionProps {
  action: WorkflowAction;
  onUpdate: (id: string, updates: Partial<WorkflowAction>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const SortableAction = ({ action, onUpdate, onDelete, onDuplicate }: SortableActionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getActionIcon = () => {
    switch (action.type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
      case "whatsapp":
      case "telegram":
        return <MessageSquare className="h-4 w-4" />;
      case "delay":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionLabel = () => {
    switch (action.type) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      case "telegram":
        return "Telegram";
      case "delay":
        return "Délai";
      default:
        return action.type;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionIcon()}
                  <Badge variant="outline">{getActionLabel()}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDuplicate(action.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(action.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {action.type === "delay" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Durée</Label>
                    <Input
                      type="number"
                      min="1"
                      value={action.config.delay?.value || 1}
                      onChange={(e) =>
                        onUpdate(action.id, {
                          config: {
                            ...action.config,
                            delay: {
                              ...action.config.delay,
                              value: parseInt(e.target.value),
                              unit: action.config.delay?.unit || "hours",
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unité</Label>
                    <Select
                      value={action.config.delay?.unit || "hours"}
                      onValueChange={(value: "minutes" | "hours" | "days") =>
                        onUpdate(action.id, {
                          config: {
                            ...action.config,
                            delay: {
                              ...action.config.delay,
                              value: action.config.delay?.value || 1,
                              unit: value,
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Heures</SelectItem>
                        <SelectItem value="days">Jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs">Destinataires</Label>
                    <Select
                      value={action.config.recipients || "all"}
                      onValueChange={(value: "all" | "confirmed" | "pending" | "declined") =>
                        onUpdate(action.id, {
                          config: { ...action.config, recipients: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="confirmed">Confirmés</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="declined">Refusés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {action.type === "email" && (
                    <div>
                      <Label className="text-xs">Template</Label>
                      <Input
                        value={action.config.template || ""}
                        onChange={(e) =>
                          onUpdate(action.id, {
                            config: { ...action.config, template: e.target.value },
                          })
                        }
                        placeholder="Nom du template"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Textarea
                      value={action.config.message || ""}
                      onChange={(e) =>
                        onUpdate(action.id, {
                          config: { ...action.config, message: e.target.value },
                        })
                      }
                      placeholder="Message à envoyer"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const WorkflowVisualEditor = ({ actions, onChange, eventId }: WorkflowVisualEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((action) => action.id === active.id);
      const newIndex = actions.findIndex((action) => action.id === over.id);
      onChange(arrayMove(actions, oldIndex, newIndex));
    }
  };

  const handleAddAction = (type: WorkflowAction["type"]) => {
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      type,
      config: type === "delay" 
        ? { delay: { value: 1, unit: "hours" } }
        : { recipients: "all", message: "" },
    };
    onChange([...actions, newAction]);
  };

  const handleUpdateAction = (id: string, updates: Partial<WorkflowAction>) => {
    onChange(
      actions.map((action) =>
        action.id === id ? { ...action, ...updates } : action
      )
    );
  };

  const handleDeleteAction = (id: string) => {
    onChange(actions.filter((action) => action.id !== id));
  };

  const handleDuplicateAction = (id: string) => {
    const actionToDuplicate = actions.find((action) => action.id === id);
    if (actionToDuplicate) {
      const newAction: WorkflowAction = {
        ...actionToDuplicate,
        id: `action-${Date.now()}`,
      };
      const index = actions.findIndex((action) => action.id === id);
      const newActions = [...actions];
      newActions.splice(index + 1, 0, newAction);
      onChange(newActions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Actions du Workflow</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddAction("email")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddAction("sms")}
        >
          <Plus className="h-4 w-4 mr-2" />
          SMS
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddAction("whatsapp")}
        >
          <Plus className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddAction("telegram")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Telegram
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddAction("delay")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Délai
        </Button>
      </div>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune action. Ajoutez votre première action ci-dessus.
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={actions.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {actions.map((action) => (
              <SortableAction
                key={action.id}
                action={action}
                onUpdate={handleUpdateAction}
                onDelete={handleDeleteAction}
                onDuplicate={handleDuplicateAction}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévisualisation du Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={action.id} className="relative">
                {index > 0 && (
                  <div className="absolute left-4 -top-4 w-0.5 h-4 bg-border" />
                )}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <CardTitle className="text-sm">
                        {action.type === "email" && "Envoi Email"}
                        {action.type === "sms" && "Envoi SMS"}
                        {action.type === "whatsapp" && "Envoi WhatsApp"}
                        {action.type === "telegram" && "Envoi Telegram"}
                        {action.type === "delay" && "Attendre"}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {action.type === "delay" ? (
                      <p>
                        Attendre {action.config.delay?.value}{" "}
                        {action.config.delay?.unit === "minutes" && "minute(s)"}
                        {action.config.delay?.unit === "hours" && "heure(s)"}
                        {action.config.delay?.unit === "days" && "jour(s)"}
                      </p>
                    ) : (
                      <>
                        <p className="mb-2">
                          <strong>À:</strong>{" "}
                          {action.config.recipients === "all" && "Tous les invités"}
                          {action.config.recipients === "confirmed" && "Invités confirmés"}
                          {action.config.recipients === "pending" && "Invités en attente"}
                          {action.config.recipients === "declined" && "Invités ayant refusé"}
                        </p>
                        {action.config.template && (
                          <p className="mb-2">
                            <strong>Template:</strong> {action.config.template}
                          </p>
                        )}
                        {action.config.message && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="whitespace-pre-wrap">{action.config.message}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
