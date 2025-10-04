import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventCoverUploadProps {
  eventId?: string;
  onImageUploaded?: (url: string) => void;
  currentImageUrl?: string;
}

const EventCoverUpload = ({ eventId, onImageUploaded, currentImageUrl }: EventCoverUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId || 'temp'}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage error:', error);
        throw new Error(error.message || "Erreur lors de l'upload");
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après l'upload");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique");
      }

      const publicUrl = urlData.publicUrl;
      
      onImageUploaded?.(publicUrl);

      toast({
        title: "Succès",
        description: "Image de couverture uploadée avec succès !",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error?.message || "Impossible d'uploader l'image";
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
      });
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          Photo de Couverture
        </CardTitle>
        <CardDescription>
          Uploadez une image de couverture pour votre événement (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrl ? (
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img 
                src={previewUrl} 
                alt="Aperçu de la couverture" 
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="aspect-video w-full border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Cliquez pour sélectionner une image</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP jusqu'à 5MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Upload en cours...' : 'Changer l\'image'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCoverUpload;