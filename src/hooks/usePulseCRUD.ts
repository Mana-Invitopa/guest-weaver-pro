import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PulseMetric {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  user_id: string;
}

export interface SystemAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  user_id: string;
}

// Fetch pulse metrics
export const usePulseMetrics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pulse-metrics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Mock data for now - will be replaced with real DB query
      const mockMetrics: PulseMetric[] = [
        {
          id: '1',
          name: 'Événements actifs',
          value: '24',
          change: 12.5,
          trend: 'up',
          timestamp: new Date().toISOString(),
          user_id: user.id
        },
        {
          id: '2',
          name: 'Invités confirmés',
          value: '1,234',
          change: 8.3,
          trend: 'up',
          timestamp: new Date().toISOString(),
          user_id: user.id
        },
        {
          id: '3',
          name: 'Taux de réponse',
          value: '87%',
          change: -2.1,
          trend: 'down',
          timestamp: new Date().toISOString(),
          user_id: user.id
        },
        {
          id: '4',
          name: 'Emails envoyés',
          value: '5,678',
          change: 0,
          trend: 'stable',
          timestamp: new Date().toISOString(),
          user_id: user.id
        }
      ];
      
      return mockMetrics;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Fetch system alerts
export const useSystemAlerts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['system-alerts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Mock data for now
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'success',
          title: 'Événement publié',
          message: 'Votre événement "Gala de charité 2024" a été publié avec succès',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          user_id: user.id
        },
        {
          id: '2',
          type: 'warning',
          title: 'Date limite RSVP approche',
          message: 'La date limite de réponse pour "Conférence Tech" est dans 2 jours',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          user_id: user.id
        },
        {
          id: '3',
          type: 'info',
          title: 'Nouveau collaborateur ajouté',
          message: 'Marie Dupont a été ajoutée comme collaboratrice sur "Mariage Sophie & Pierre"',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          user_id: user.id
        }
      ];
      
      return mockAlerts;
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });
};

// Mark alert as read
export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-alerts'] });
      toast.success('Alerte marquée comme lue');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de l\'alerte');
    }
  });
};

// Create custom metric
export const useCreateMetric = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (metric: Omit<PulseMetric, 'id' | 'user_id' | 'timestamp'>) => {
      if (!user) throw new Error('Not authenticated');
      
      // This would be a real DB insert
      const newMetric: PulseMetric = {
        ...metric,
        id: Date.now().toString(),
        user_id: user.id,
        timestamp: new Date().toISOString()
      };
      
      return newMetric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-metrics'] });
      toast.success('Métrique créée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la métrique');
    }
  });
};

// Delete metric
export const useDeleteMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metricId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return metricId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulse-metrics'] });
      toast.success('Métrique supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });
};
