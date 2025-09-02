import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InvitationDesignUploadProps {
  eventId?: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
}

const InvitationDesignUpload = ({ eventId, currentImageUrl, onImageUploaded }: InvitationDesignUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "");
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner un fichier JPG, JPEG, PNG ou WEBP",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille du fichier ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${eventId || 'temp'}-invitation-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('invitation-designs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('invitation-designs')
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      
      toast({
        title: "Succès",
        description: "Design d'invitation uploadé avec succès !",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le fichier. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onImageUploaded("");
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-accent" />
          Design d'Invitation
        </CardTitle>
        <CardDescription>
          Uploadez une image d'invitation personnalisée (JPG, JPEG, PNG, WEBP - Max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Design d'invitation" 
                className="w-full max-h-64 object-contain rounded-lg border border-border bg-muted"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Design d'invitation actuel - Cliquez sur X pour supprimer
            </p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Upload Design d'Invitation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Glissez-déposez ou cliquez pour sélectionner
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="invitation-upload" className="cursor-pointer">
            <Input
              id="invitation-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {previewUrl ? 'Changer le design' : 'Sélectionner un fichier'}
                  </>
                )}
              </span>
            </Button>
          </Label>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Formats supportés: JPG, JPEG, PNG, WEBP</p>
          <p>• Taille maximale: 5MB</p>
          <p>• Recommandé: Image de qualité design avec ratio portrait</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationDesignUpload;