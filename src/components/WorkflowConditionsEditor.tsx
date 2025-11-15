import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GitBranch } from "lucide-react";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicOperator?: "AND" | "OR";
}

interface WorkflowConditionsEditorProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

export const WorkflowConditionsEditor = ({ conditions, onChange }: WorkflowConditionsEditorProps) => {
  const fieldOptions = [
    { value: "rsvp_status", label: "Statut RSVP" },
    { value: "guest_count", label: "Nombre d'invités" },
    { value: "days_before_event", label: "Jours avant événement" },
    { value: "hours_before_event", label: "Heures avant événement" },
    { value: "table_number", label: "Numéro de table" },
    { value: "dietary_restrictions", label: "Restrictions alimentaires" },
    { value: "checked_in", label: "Enregistrement effectué" },
    { value: "invitation_method", label: "Méthode d'invitation" },
    { value: "email_opened", label: "Email ouvert" },
    { value: "link_clicked", label: "Lien cliqué" },
  ];

  const operatorOptions = [
    { value: "equals", label: "Est égal à" },
    { value: "not_equals", label: "N'est pas égal à" },
    { value: "greater_than", label: "Supérieur à" },
    { value: "less_than", label: "Inférieur à" },
    { value: "contains", label: "Contient" },
    { value: "not_contains", label: "Ne contient pas" },
    { value: "is_empty", label: "Est vide" },
    { value: "is_not_empty", label: "N'est pas vide" },
  ];

  const handleAddCondition = () => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      field: "rsvp_status",
      operator: "equals",
      value: "",
      logicOperator: conditions.length > 0 ? "AND" : undefined,
    };
    onChange([...conditions, newCondition]);
  };

  const handleUpdateCondition = (id: string, updates: Partial<Condition>) => {
    onChange(
      conditions.map((condition) =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    );
  };

  const handleDeleteCondition = (id: string) => {
    onChange(conditions.filter((condition) => condition.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            <CardTitle>Conditions Avancées</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={handleAddCondition}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une condition
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Aucune condition définie</p>
            <p className="text-xs mt-1">
              Le workflow s'exécutera sans conditions préalables
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3">
                {index > 0 && condition.logicOperator && (
                  <div className="flex items-center justify-center">
                    <Select
                      value={condition.logicOperator}
                      onValueChange={(value: "AND" | "OR") =>
                        handleUpdateCondition(condition.id, { logicOperator: value })
                      }
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">ET</SelectItem>
                        <SelectItem value="OR">OU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Champ</Label>
                          <Select
                            value={condition.field}
                            onValueChange={(value) =>
                              handleUpdateCondition(condition.id, { field: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Opérateur</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              handleUpdateCondition(condition.id, { operator: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operatorOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Valeur</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) =>
                              handleUpdateCondition(condition.id, { value: e.target.value })
                            }
                            placeholder="Valeur à comparer"
                            disabled={
                              condition.operator === "is_empty" ||
                              condition.operator === "is_not_empty"
                            }
                          />
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCondition(condition.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {conditions.length > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Résumé de la logique :</p>
            <div className="text-xs text-muted-foreground space-y-1">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center gap-2">
                  {index > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {condition.logicOperator}
                    </Badge>
                  )}
                  <span>
                    {fieldOptions.find(f => f.value === condition.field)?.label}{" "}
                    {operatorOptions.find(o => o.value === condition.operator)?.label}{" "}
                    {condition.value && `"${condition.value}"`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
