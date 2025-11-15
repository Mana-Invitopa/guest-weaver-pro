import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  Mail,
  MessageSquare,
  Zap,
  Calendar
} from "lucide-react";
import { EventWorkflow } from "@/hooks/useWorkflowsCRUD";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WorkflowAnalyticsProps {
  workflows: EventWorkflow[];
}

export const WorkflowAnalytics = ({ workflows }: WorkflowAnalyticsProps) => {
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === "active").length;
  const pausedWorkflows = workflows.filter(w => w.status === "paused").length;
  const completedWorkflows = workflows.filter(w => w.status === "completed").length;
  
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);
  const avgExecutionsPerWorkflow = totalWorkflows > 0 ? (totalExecutions / totalWorkflows).toFixed(1) : "0";
  
  const emailActions = workflows.reduce((sum, w) => 
    sum + w.actions.filter(a => a.type === "email").length, 0
  );
  const messagingActions = workflows.reduce((sum, w) => 
    sum + w.actions.filter(a => ["sms", "whatsapp", "telegram"].includes(a.type)).length, 0
  );
  const delayActions = workflows.reduce((sum, w) => 
    sum + w.actions.filter(a => a.type === "delay").length, 0
  );

  const activityRate = totalWorkflows > 0 ? (activeWorkflows / totalWorkflows) * 100 : 0;
  
  const recentlyExecuted = workflows
    .filter(w => w.last_executed_at)
    .sort((a, b) => 
      new Date(b.last_executed_at!).getTime() - new Date(a.last_executed_at!).getTime()
    )
    .slice(0, 5);

  const mostUsedWorkflows = [...workflows]
    .sort((a, b) => (b.execution_count || 0) - (a.execution_count || 0))
    .slice(0, 5);

  const triggerTypesStats = {
    manual: workflows.filter(w => w.trigger_type === "manual").length,
    scheduled: workflows.filter(w => w.trigger_type === "scheduled").length,
    conditional: workflows.filter(w => w.trigger_type === "conditional").length,
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Analytics des Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalWorkflows}</div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="default" className="text-xs">
                  {activeWorkflows} actifs
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {pausedWorkflows} en pause
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exécutions Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalExecutions}</div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Moyenne: {avgExecutionsPerWorkflow} par workflow
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux d'Activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl font-bold">{activityRate.toFixed(0)}%</div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={activityRate} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Workflows Terminés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{completedWorkflows}</div>
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {totalWorkflows > 0 ? ((completedWorkflows / totalWorkflows) * 100).toFixed(0) : 0}% du total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Types d'actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Répartition des Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Actions Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailActions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalWorkflows > 0 ? (emailActions / totalWorkflows).toFixed(1) : 0} par workflow
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Messages Instantanés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messagingActions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                SMS, WhatsApp, Telegram
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Délais Programmés</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{delayActions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Temporisations configurées
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Types de déclencheurs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Types de Déclencheurs</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Manuel</span>
                  <span className="text-sm text-muted-foreground">
                    {triggerTypesStats.manual}
                  </span>
                </div>
                <Progress 
                  value={totalWorkflows > 0 ? (triggerTypesStats.manual / totalWorkflows) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Planifié</span>
                  <span className="text-sm text-muted-foreground">
                    {triggerTypesStats.scheduled}
                  </span>
                </div>
                <Progress 
                  value={totalWorkflows > 0 ? (triggerTypesStats.scheduled / totalWorkflows) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Conditionnel</span>
                  <span className="text-sm text-muted-foreground">
                    {triggerTypesStats.conditional}
                  </span>
                </div>
                <Progress 
                  value={totalWorkflows > 0 ? (triggerTypesStats.conditional / totalWorkflows) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflows les plus utilisés */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Top 5 - Plus Utilisés</CardTitle>
            </div>
            <CardDescription>Classés par nombre d'exécutions</CardDescription>
          </CardHeader>
          <CardContent>
            {mostUsedWorkflows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune exécution enregistrée
              </p>
            ) : (
              <div className="space-y-3">
                {mostUsedWorkflows.map((workflow, index) => (
                  <div key={workflow.id} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {workflow.execution_count || 0} exécution(s)
                      </p>
                    </div>
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                      {workflow.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dernières exécutions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Dernières Exécutions</CardTitle>
            </div>
            <CardDescription>Activité récente des workflows</CardDescription>
          </CardHeader>
          <CardContent>
            {recentlyExecuted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune exécution récente
              </p>
            ) : (
              <div className="space-y-3">
                {recentlyExecuted.map((workflow) => (
                  <div key={workflow.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {workflow.last_executed_at &&
                          format(new Date(workflow.last_executed_at), "PPp", { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
