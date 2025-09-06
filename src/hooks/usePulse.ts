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
      
      // Simulate real-time data for demo
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
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user?.id,
  });
};

export const useSystemAlerts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["system-alerts", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user found");
      
      // Simulate alerts for demo
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
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!user?.id,
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      // In a real app, this would update the database
      console.log("Marking alert as read:", alertId);
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-alerts"] });
    },
  });
};