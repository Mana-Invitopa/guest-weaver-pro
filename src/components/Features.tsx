import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, QrCode, BarChart3, Mail, Smartphone } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Création d'Événements",
      description: "Créez facilement vos événements avec tous les détails nécessaires et des templates personnalisables.",
    },
    {
      icon: Users,
      title: "Gestion des Invités",
      description: "Importez vos listes d'invités via CSV ou ajoutez-les manuellement. Suivez les réponses en temps réel.",
    },
    {
      icon: QrCode,
      title: "QR Codes & Tokens",
      description: "Chaque invité reçoit un QR code unique pour un check-in facile et sécurisé le jour de l'événement.",
    },
    {
      icon: Mail,
      title: "Distribution Multi-Canal",
      description: "Envoyez vos invitations par email et SMS/WhatsApp avec des liens personnalisés.",
    },
    {
      icon: Smartphone,
      title: "Check-in Mobile",
      description: "Scanner QR codes ou saisir des tokens pour marquer la présence des invités en temps réel.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Export",
      description: "Suivez les statistiques de participation et exportez vos données en CSV.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une solution complète pour gérer vos événements, de l'invitation au check-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="shadow-card hover:shadow-elegant transition-smooth transform hover:-translate-y-1 border-0"
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-white shadow-elegant">
            <h3 className="text-3xl font-bold mb-4">
              Prêt à créer votre premier événement ?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'organisateurs qui font confiance à Invitopia Mini 
              pour leurs événements les plus importants.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-sm text-white/80 mb-4">
                <strong>Note:</strong> Pour utiliser toutes les fonctionnalités (authentification, base de données, envoi d'emails), 
                veuillez connecter Supabase via le bouton vert en haut à droite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;