import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Image, 
  Video, 
  Mail, 
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Upload,
  Globe,
  Lock,
  Users,
  Calendar,
  Tag,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  type: 'template' | 'asset' | 'notification' | 'page';
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  visibility: 'public' | 'private' | 'restricted';
  created_at: string;
  updated_at: string;
  author: string;
  category: string;
  tags: string[];
  usage_count?: number;
}

const ContentManagement = () => {
  const [selectedTab, setSelectedTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data for demonstration
  const mockContent: ContentItem[] = [
    {
      id: "1",
      type: "template",
      title: "Invitation Mariage Élégant",
      description: "Template d'invitation pour mariage avec design élégant et moderne",
      status: "published",
      visibility: "public",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-20T14:30:00Z",
      author: "Admin",
      category: "Mariage",
      tags: ["mariage", "élégant", "moderne"],
      usage_count: 45
    },
    {
      id: "2",
      type: "asset",
      title: "Logo Invitopia HD",
      description: "Logo officiel en haute définition avec variantes",
      status: "published",
      visibility: "public",
      created_at: "2024-01-10T09:00:00Z",
      updated_at: "2024-01-10T09:00:00Z",
      author: "Design Team",
      category: "Branding",
      tags: ["logo", "branding", "hd"],
      usage_count: 120
    },
    {
      id: "3",
      type: "notification",
      title: "Email de Confirmation RSVP",
      description: "Template d'email envoyé lors de la confirmation d'une invitation",
      status: "published",
      visibility: "private",
      created_at: "2024-01-12T11:00:00Z",
      updated_at: "2024-01-18T16:45:00Z",
      author: "Admin",
      category: "Email",
      tags: ["email", "rsvp", "confirmation"],
      usage_count: 78
    }
  ];

  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline"
    };
    const colors = {
      published: "text-success",
      draft: "text-warning", 
      archived: "text-muted-foreground"
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} 
             className={colors[status as keyof typeof colors]}>
        {status === 'published' ? 'Publié' : 
         status === 'draft' ? 'Brouillon' : 'Archivé'}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return <FileText className="w-4 h-4" />;
      case 'asset': return <Image className="w-4 h-4" />;
      case 'notification': return <Mail className="w-4 h-4" />;
      case 'page': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4 text-success" />;
      case 'private': return <Lock className="w-4 h-4 text-warning" />;
      case 'restricted': return <Users className="w-4 h-4 text-info" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = selectedTab === 'all' || item.type === selectedTab.slice(0, -1);
    
    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(content.map(item => item.category)));

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion de Contenu</h1>
            <p className="text-muted-foreground">
              Gérez tous vos contenus, templates et ressources de la plateforme
            </p>
          </div>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Contenu
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Templates</p>
                  <p className="text-2xl font-bold">
                    {content.filter(item => item.type === 'template').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assets</p>
                  <p className="text-2xl font-bold">
                    {content.filter(item => item.type === 'asset').length}
                  </p>
                </div>
                <Image className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                  <p className="text-2xl font-bold">
                    {content.filter(item => item.type === 'notification').length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisation Totale</p>
                  <p className="text-2xl font-bold">
                    {content.reduce((sum, item) => sum + (item.usage_count || 0), 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher du contenu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid gap-4">
              {filteredContent.map((item) => (
                <Card key={item.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTypeIcon(item.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            {getStatusBadge(item.status)}
                            {getVisibilityIcon(item.visibility)}
                          </div>
                          
                          <p className="text-muted-foreground mb-3">
                            {item.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.author}
                            </div>
                            {item.usage_count && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {item.usage_count} utilisations
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredContent.length === 0 && (
                <Card className="shadow-card">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun contenu trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                      Aucun contenu ne correspond à vos critères de recherche.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer du contenu
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default ContentManagement;