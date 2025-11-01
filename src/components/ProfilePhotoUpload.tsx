import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  Trash2, 
  ImageIcon, 
  User, 
  CheckCircle,
  X,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded?: (url: string) => void;
  userName?: string;
}

const ProfilePhotoUpload = ({ currentPhotoUrl, onPhotoUploaded, userName }: ProfilePhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max for profile photos
      toast.error("L'image ne doit pas dépasser 2MB");
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage - using a user avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // First, make sure the avatars bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarBucket) {
        // Create bucket if it doesn't exist
        await supabase.storage.createBucket('avatars', { public: true });
      }
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      onPhotoUploaded?.(publicUrl);

      toast.success("Photo de profil mise à jour avec succès !");

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Impossible d'uploader la photo. Veuillez réessayer.");
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user) return;

    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onPhotoUploaded?.('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success("Photo de profil supprimée");
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error("Impossible de supprimer la photo");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Photo de Profil
        </CardTitle>
        <CardDescription>
          Personnalisez votre profil avec une photo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-border">
              <AvatarImage src={previewUrl || undefined} alt="Photo de profil" />
              <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            {previewUrl && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={removePhoto}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-background"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center">
            <h4 className="font-medium">{userName || 'Utilisateur'}</h4>
            <p className="text-sm text-muted-foreground">
              {previewUrl ? 'Photo personnalisée' : 'Photo par défaut'}
            </p>
          </div>
        </div>

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
            {uploading ? 'Upload en cours...' : 'Changer la photo'}
          </Button>
          
          {previewUrl && (
            <Button 
              variant="outline" 
              onClick={removePhoto}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>

        <div className="bg-muted/20 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            • Formats acceptés : JPG, PNG, WEBP
            <br />
            • Taille maximale : 2MB
            <br />
            • Recommandé : image carrée pour un meilleur rendu
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePhotoUpload;