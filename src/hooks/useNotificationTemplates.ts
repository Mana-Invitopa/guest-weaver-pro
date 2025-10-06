import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationTemplates = (category?: string) => {
  return useQuery({
    queryKey: ["notification-templates", category],
    queryFn: async () => {
      let query = supabase
        .from("notification_templates")
        .select("*")
        .eq("is_default", true)
        .eq("type", "email");

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as NotificationTemplate[];
    },
  });
};
