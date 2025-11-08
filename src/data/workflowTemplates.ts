import { Mail, Clock, MessageCircle, CheckCircle, Heart, Calendar } from "lucide-react";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'invitation' | 'reminder' | 'followup';
  icon: any;
  color: string;
  trigger_type: 'manual' | 'scheduled' | 'conditional';
  trigger_conditions: any;
  actions: Array<{
    id: string;
    type: 'email' | 'sms' | 'whatsapp' | 'telegram' | 'delay';
    config: {
      template?: string;
      delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
      recipients?: 'all' | 'confirmed' | 'pending' | 'declined';
      message?: string;
    };
  }>;
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'complete-invitation-sequence',
    name: 'Séquence d\'invitation complète',
    description: 'Envoi d\'invitation initial + 2 rappels automatiques pour les invités n\'ayant pas répondu',
    category: 'invitation',
    icon: Mail,
    color: 'bg-accent',
    trigger_type: 'manual',
    trigger_conditions: {},
    actions: [
      {
        id: '1',
        type: 'email',
        config: {
          recipients: 'all',
          message: '🎉 Vous êtes cordialement invité(e) à notre événement ! Merci de confirmer votre présence en cliquant sur le lien ci-dessous.',
          template: 'invitation_initiale'
        }
      },
      {
        id: '2',
        type: 'delay',
        config: {
          delay: { value: 3, unit: 'days' }
        }
      },
      {
        id: '3',
        type: 'email',
        config: {
          recipients: 'pending',
          message: '⏰ Rappel : N\'oubliez pas de confirmer votre présence à notre événement. Nous aimerions vraiment vous compter parmi nous !',
          template: 'rappel_1'
        }
      },
      {
        id: '4',
        type: 'delay',
        config: {
          delay: { value: 3, unit: 'days' }
        }
      },
      {
        id: '5',
        type: 'email',
        config: {
          recipients: 'pending',
          message: '🔔 Dernière chance ! Les inscriptions ferment bientôt. Confirmez votre présence dès maintenant.',
          template: 'rappel_final'
        }
      }
    ]
  },
  {
    id: 'pre-event-reminders',
    name: 'Rappels automatiques avant événement',
    description: 'Série de rappels 7 jours, 3 jours et 1 jour avant l\'événement pour les participants confirmés',
    category: 'reminder',
    icon: Clock,
    color: 'bg-warning',
    trigger_type: 'scheduled',
    trigger_conditions: {
      timing: 'before_event',
      intervals: [7, 3, 1]
    },
    actions: [
      {
        id: '1',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '📅 Plus qu\'une semaine ! Nous sommes impatients de vous voir à notre événement. Voici quelques informations importantes...',
          template: 'rappel_7_jours'
        }
      },
      {
        id: '2',
        type: 'delay',
        config: {
          delay: { value: 4, unit: 'days' }
        }
      },
      {
        id: '3',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '⏳ C\'est dans 3 jours ! Préparez-vous pour un moment inoubliable. N\'oubliez pas de consulter le programme.',
          template: 'rappel_3_jours'
        }
      },
      {
        id: '4',
        type: 'delay',
        config: {
          delay: { value: 2, unit: 'days' }
        }
      },
      {
        id: '5',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '🎊 C\'est demain ! Derniers détails pratiques : horaires, lieu de rendez-vous, et programme de la journée.',
          template: 'rappel_1_jour'
        }
      }
    ]
  },
  {
    id: 'post-event-thanks',
    name: 'Remerciements post-événement',
    description: 'Email de remerciement automatique le lendemain de l\'événement avec demande de feedback',
    category: 'followup',
    icon: Heart,
    color: 'bg-success',
    trigger_type: 'scheduled',
    trigger_conditions: {
      timing: 'after_event',
      delay: 1
    },
    actions: [
      {
        id: '1',
        type: 'delay',
        config: {
          delay: { value: 1, unit: 'days' }
        }
      },
      {
        id: '2',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '💝 Merci d\'avoir participé ! Votre présence a rendu cet événement encore plus spécial. Nous aimerions connaître votre avis...',
          template: 'remerciement'
        }
      }
    ]
  },
  {
    id: 'quick-invitation',
    name: 'Invitation simple',
    description: 'Envoi d\'invitation unique sans rappel automatique',
    category: 'invitation',
    icon: MessageCircle,
    color: 'bg-primary',
    trigger_type: 'manual',
    trigger_conditions: {},
    actions: [
      {
        id: '1',
        type: 'email',
        config: {
          recipients: 'all',
          message: '🎉 Vous êtes invité(e) à notre événement ! Merci de confirmer votre présence.',
          template: 'invitation_simple'
        }
      }
    ]
  },
  {
    id: 'last-minute-reminder',
    name: 'Rappel de dernière minute',
    description: 'Rappel urgent 24h avant l\'événement pour les participants confirmés',
    category: 'reminder',
    icon: Calendar,
    color: 'bg-destructive',
    trigger_type: 'scheduled',
    trigger_conditions: {
      timing: 'before_event',
      hours: 24
    },
    actions: [
      {
        id: '1',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '⚡ C\'est pour bientôt ! Rendez-vous dans 24h. Vérifiez bien l\'heure et le lieu.',
          template: 'rappel_urgent'
        }
      },
      {
        id: '2',
        type: 'sms',
        config: {
          recipients: 'confirmed',
          message: 'Rappel : Événement demain ! 📍 [Lieu] ⏰ [Heure]'
        }
      }
    ]
  },
  {
    id: 'vip-sequence',
    name: 'Séquence VIP personnalisée',
    description: 'Communication premium avec messages WhatsApp et emails personnalisés',
    category: 'invitation',
    icon: CheckCircle,
    color: 'bg-gradient-primary',
    trigger_type: 'manual',
    trigger_conditions: {},
    actions: [
      {
        id: '1',
        type: 'email',
        config: {
          recipients: 'all',
          message: '✨ Invitation exclusive ! En tant qu\'invité privilégié, nous sommes ravis de vous convier à cet événement d\'exception.',
          template: 'invitation_vip'
        }
      },
      {
        id: '2',
        type: 'delay',
        config: {
          delay: { value: 2, unit: 'days' }
        }
      },
      {
        id: '3',
        type: 'whatsapp',
        config: {
          recipients: 'pending',
          message: '🌟 Nous espérons pouvoir compter sur votre présence à notre événement exclusif.'
        }
      },
      {
        id: '4',
        type: 'delay',
        config: {
          delay: { value: 1, unit: 'days' }
        }
      },
      {
        id: '5',
        type: 'email',
        config: {
          recipients: 'confirmed',
          message: '🎖️ Merci pour votre confirmation ! Voici votre accès VIP et les informations privilégiées.',
          template: 'confirmation_vip'
        }
      }
    ]
  }
];

export const getTemplatesByCategory = (category: 'invitation' | 'reminder' | 'followup') => {
  return workflowTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return workflowTemplates.find(template => template.id === id);
};

export const categories = [
  { value: 'invitation', label: 'Invitations', description: 'Envoi d\'invitations et relances' },
  { value: 'reminder', label: 'Rappels', description: 'Rappels avant l\'événement' },
  { value: 'followup', label: 'Suivi', description: 'Remerciements et feedback' }
];
