import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Search,
  Star,
  Users,
  Calendar,
  Mail,
  Settings,
  Zap,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  ExternalLink,
  MessageCircle,
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  const categories = [
    {
      id: "getting-started",
      name: "Prise en main",
      icon: PlayCircle,
      description: "Commencez rapidement avec Invitopia Mini"
    },
    {
      id: "events",
      name: "Gestion d'événements",
      icon: Calendar,
      description: "Créer et gérer vos événements"
    },
    {
      id: "invitations",
      name: "Invitations",
      icon: Mail,
      description: "Envoyer et personnaliser vos invitations"
    },
    {
      id: "guests",
      name: "Gestion des invités",
      icon: Users,
      description: "Gérer votre liste d'invités et RSVPs"
    },
    {
      id: "workflows",
      name: "Workflows",
      icon: Zap,
      description: "Automatiser vos processus d'événements"
    },
    {
      id: "integrations",
      name: "Intégrations",
      icon: Globe,
      description: "Connecter des services externes"
    },
    {
      id: "api",
      name: "API",
      icon: FileText,
      description: "Documentation technique pour développeurs"
    }
  ];

  const articles = {
    "getting-started": [
      {
        title: "Installation et configuration",
        description: "Guide d'installation complet pour débuter avec Invitopia Mini",
        readTime: "5 min",
        difficulty: "Débutant",
        popular: true
      },
      {
        title: "Créer votre premier événement",
        description: "Étapes détaillées pour créer votre premier événement",
        readTime: "8 min",
        difficulty: "Débutant",
        popular: true
      },
      {
        title: "Configuration des paramètres",
        description: "Personnaliser votre profil et vos préférences",
        readTime: "6 min",
        difficulty: "Débutant",
        popular: false
      }
    ],
    "events": [
      {
        title: "Types d'événements supportés",
        description: "Découvrez tous les types d'événements que vous pouvez créer",
        readTime: "10 min",
        difficulty: "Intermédiaire",
        popular: true
      },
      {
        title: "Planification d'événements récurrents",
        description: "Créer des événements qui se répètent automatiquement",
        readTime: "12 min",
        difficulty: "Intermédiaire",
        popular: false
      },
      {
        title: "Gestion des collaborateurs",
        description: "Inviter des collaborateurs à gérer vos événements",
        readTime: "7 min",
        difficulty: "Avancé",
        popular: false
      }
    ],
    "invitations": [
      {
        title: "Personnaliser vos invitations",
        description: "Créer des invitations attrayantes avec des thèmes personnalisés",
        readTime: "15 min",
        difficulty: "Intermédiaire",
        popular: true
      },
      {
        title: "Envoi en masse d'invitations",
        description: "Techniques pour envoyer des invitations à de nombreux invités",
        readTime: "9 min",
        difficulty: "Débutant",
        popular: true
      },
      {
        title: "Suivi des réponses RSVP",
        description: "Monitorer et gérer les réponses de vos invités",
        readTime: "6 min",
        difficulty: "Débutant",
        popular: false
      }
    ]
    // ... autres catégories
  };

  const features = [
    {
      icon: Calendar,
      title: "Gestion d'événements complète",
      description: "Créez, gérez et suivez tous vos événements depuis une interface intuitive"
    },
    {
      icon: Mail,
      title: "Invitations personnalisées",
      description: "Créez des invitations uniques avec des thèmes personnalisables"
    },
    {
      icon: Users,
      title: "Gestion d'invités avancée",
      description: "Gérez vos listes d'invités, tables et check-ins facilement"
    },
    {
      icon: Zap,
      title: "Workflows automatisés",
      description: "Automatisez vos rappels et communications avec vos invités"
    },
    {
      icon: Shield,
      title: "Sécurité et confidentialité",
      description: "Contrôlez la visibilité et l'accès à vos événements"
    },
    {
      icon: Smartphone,
      title: "Expérience mobile optimisée",
      description: "Interface responsive parfaitement adaptée aux mobiles"
    }
  ];

  const stats = [
    { label: "Événements créés", value: "10,000+" },
    { label: "Invitations envoyées", value: "500,000+" },
    { label: "Utilisateurs actifs", value: "2,500+" },
    { label: "Taux de satisfaction", value: "98%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Documentation Invitopia Mini
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Tout ce que vous devez savoir pour créer des événements inoubliables
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Rechercher dans la documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-muted-foreground text-lg">
              Découvrez toutes les fonctionnalités qui font d'Invitopia Mini la solution idéale
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-card sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Catégories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="space-y-1 p-4">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start gap-3 h-auto p-3"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <category.icon className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {category.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Category Header */}
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {categories.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>

                {/* Articles */}
                <div className="grid gap-4">
                  {articles[selectedCategory as keyof typeof articles]?.map((article, index) => (
                    <Card key={index} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {article.title}
                              </h3>
                              {article.popular && (
                                <Badge className="bg-warning text-warning-foreground">
                                  <Star className="w-3 h-3 mr-1" />
                                  Populaire
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">
                              {article.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{article.readTime} de lecture</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {article.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="shadow-card bg-gradient-subtle">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">
                        Besoin d'aide supplémentaire ?
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Notre équipe est là pour vous accompagner
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="bg-gradient-primary">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contacter le support
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger les guides
                        </Button>
                        <Button variant="outline">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Tutoriels vidéo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Heart className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Prêt à créer votre premier événement ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Rejoignez des milliers d'organisateurs qui font confiance à Invitopia Mini
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Voir la démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Documentation;