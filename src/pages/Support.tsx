import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Phone, Send, Book, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Support = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      toast({
        title: "Message envoyé",
        description: "Notre équipe vous répondra dans les 24 heures",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setSending(false);
    }, 1500);
  };

  const faqs = [
    {
      question: "Comment créer mon premier événement ?",
      answer: "Connectez-vous à votre compte, cliquez sur 'Créer un événement' dans le dashboard, puis suivez les étapes pour remplir les détails de votre événement : titre, date, lieu, description et options de personnalisation."
    },
    {
      question: "Comment inviter des participants ?",
      answer: "Dans la page de gestion de votre événement, accédez à l'onglet 'Invités', puis ajoutez les coordonnées de vos invités (nom, email, téléphone). Vous pouvez ensuite envoyer les invitations par email, WhatsApp ou Telegram."
    },
    {
      question: "Comment configurer un workflow d'automatisation ?",
      answer: "Accédez à l'onglet 'Workflows' de votre événement. Vous pouvez utiliser des templates prédéfinis ou créer un workflow personnalisé avec l'éditeur visuel. Configurez les déclencheurs, les actions et les conditions selon vos besoins."
    },
    {
      question: "Les invitations sont-elles personnalisables ?",
      answer: "Oui ! Vous pouvez personnaliser le design, télécharger votre propre image de couverture, choisir un thème de couleur et personnaliser le message pour chaque invitation. Les invitations PDF incluent automatiquement les détails de l'événement et le programme."
    },
    {
      question: "Comment suivre les confirmations de présence ?",
      answer: "Le dashboard affiche en temps réel les statistiques de confirmation. Vous recevrez également des notifications à chaque nouvelle confirmation. L'onglet 'Invités' vous permet de voir le statut de chaque participant."
    },
    {
      question: "Puis-je exporter mes données ?",
      answer: "Oui, vous pouvez exporter la liste des invités, les workflows en JSON, et générer des rapports d'analytics. Utilisez les boutons d'export disponibles dans chaque section."
    },
    {
      question: "Comment fonctionne le check-in le jour J ?",
      answer: "Utilisez le système de QR code ou le code de vérification pour enregistrer l'arrivée des invités. Le scanner QR est accessible depuis l'onglet 'Check-in' de votre événement."
    },
    {
      question: "Quels sont les canaux d'envoi d'invitations ?",
      answer: "Vous pouvez envoyer des invitations par email (avec PDF), WhatsApp, Telegram et SMS. Chaque canal peut être configuré indépendamment dans les workflows."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Support Technique</h1>
          <p className="text-muted-foreground text-lg">
            Notre équipe est là pour vous aider
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                support@invitopia.com
              </p>
              <p className="text-xs text-muted-foreground">
                Réponse sous 24h
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle>Téléphone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                +33 1 23 45 67 89
              </p>
              <p className="text-xs text-muted-foreground">
                Lun-Ven 9h-18h
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle>Chat en direct</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Assistance instantanée
              </p>
              <Button variant="outline" size="sm">
                Démarrer le chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              <CardTitle>Questions Fréquentes</CardTitle>
            </div>
            <CardDescription>
              Trouvez rapidement des réponses aux questions courantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Documentation Link */}
        <Card className="mb-12">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Book className="w-6 h-6" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>
              Guides complets et tutoriels détaillés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-semibold">Guide de démarrage</div>
                  <div className="text-sm text-muted-foreground">
                    Premiers pas avec Invitopia
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-semibold">Workflows avancés</div>
                  <div className="text-sm text-muted-foreground">
                    Automatisation complète
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-semibold">API Documentation</div>
                  <div className="text-sm text-muted-foreground">
                    Intégrations tierces
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-4">
                <div className="text-left">
                  <div className="font-semibold">Vidéos tutoriels</div>
                  <div className="text-sm text-muted-foreground">
                    Apprenez visuellement
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Contactez-nous</CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="En quoi pouvons-nous vous aider ?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre problème ou question en détail..."
                  rows={6}
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
