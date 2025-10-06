import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PulseMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const usePulseMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["pulse-metrics", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user found");
      
      // Try to fetch from database first
      const { data: dbMetrics, error } = await supabase
        .from("pulse_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(10);

      // If we have database metrics, use them
      if (!error && dbMetrics && dbMetrics.length > 0) {
        return dbMetrics.map(m => ({
          id: m.id,
          name: m.name,
          value: Number(m.value),
          change: Number(m.change),
          trend: m.trend as 'up' | 'down' | 'stable',
          timestamp: m.timestamp
        })) as PulseMetric[];
      }

      // Fallback to mock data for demo
      const mockMetrics: PulseMetric[] = [
        {
          id: "events",
          name: "Événements Actifs",
          value: 12,
          change: 8.5,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          id: "invitees",
          name: "Invités Total",
          value: 1247,
          change: -2.3,
          trend: 'down',
          timestamp: new Date().toISOString()
        },
        {
          id: "rsvp_rate",
          name: "Taux de Réponse",
          value: 87.5,
          change: 5.2,
          trend: 'up',
          timestamp: new Date().toISOString()
        },
        {
          id: "engagement",
          name: "Engagement",
          value: 94.2,
          change: 0.1,
          trend: 'stable',
          timestamp: new Date().toISOString()
        }
      ];
      
      return mockMetrics;
    },
    refetchInterval: 30000,
    enabled: !!user?.id,
  });
};

export const useSystemAlerts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["system-alerts", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user found");
      
      // Try to fetch from database first
      const { data: dbAlerts, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(20);

      // If we have database alerts, use them
      if (!error && dbAlerts && dbAlerts.length > 0) {
        return dbAlerts.map(a => ({
          id: a.id,
          type: a.type as 'info' | 'warning' | 'error' | 'success',
          title: a.title,
          message: a.message,
          timestamp: a.timestamp,
          read: a.read
        })) as SystemAlert[];
      }

      // Fallback to mock data for demo
      const mockAlerts: SystemAlert[] = [
        {
          id: "1",
          type: "success",
          title: "Nouvel événement créé",
          message: "L'événement 'Gala de fin d'année' a été créé avec succès",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: "2",
          type: "warning",
          title: "Limite d'invités atteinte",
          message: "L'événement 'Soirée networking' a atteint 90% de sa capacité",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: false
        },
        {
          id: "3",
          type: "info",
          title: "Rapport mensuel disponible",
          message: "Votre rapport d'analytics mensuel est prêt à être consulté",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      
      return mockAlerts;
    },
    refetchInterval: 10000,
    enabled: !!user?.id,
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Marking alert as read:", alertId);
      
      // Try to update in database
      const { error } = await supabase
        .from("system_alerts")
        .update({ read: true })
        .eq("id", alertId)
        .eq("user_id", user.id);

      if (error && error.code !== 'PGRST116') {
        console.error("Failed to mark alert as read:", error);
      }
      
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
      toast.success("Alerte marquée comme lue");
    },
  });
};