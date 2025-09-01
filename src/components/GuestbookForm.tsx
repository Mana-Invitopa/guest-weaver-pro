import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateGuestbookEntry } from "@/hooks/useGuestbook";
import { supabase } from "@/integrations/supabase/client";

interface GuestbookFormProps {
  eventId: string;
  inviteeId?: string;
  onSuccess?: () => void;
}

const GuestbookForm = ({ eventId, inviteeId, onSuccess }: GuestbookFormProps) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const createEntryMutation = useCreateGuestbookEntry();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "La photo ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image valide",
          variant: "destructive",
        });
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('guestbook-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('guestbook-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      toast({
        title: "Erreur",
        description: "Nom et message sont requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | undefined;

      // Upload photo if provided
      if (photo) {
        photoUrl = await uploadPhoto(photo);
      }

      // Create guestbook entry
      await createEntryMutation.mutateAsync({
        event_id: eventId,
        invitee_id: inviteeId,
        name: name.trim(),
        message: message.trim(),
        photo_url: photoUrl,
      });

      // Reset form
      setName("");
      setMessage("");
      setPhoto(null);
      setPhotoPreview("");

      toast({
        title: "Message ajouté ✨",
        description: "Votre message a été ajouté au livre d'or !",
      });

      onSuccess?.();

    } catch (error) {
      console.error('Error submitting guestbook entry:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent" />
          Livre d'Or
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestbook-name">Votre nom *</Label>
            <Input
              id="guestbook-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestbook-message">Votre message *</Label>
            <Textarea
              id="guestbook-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Partagez vos meilleurs vœux et souvenirs..."
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="guestbook-photo">Photo (optionnel)</Label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                <input
                  id="guestbook-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Label
                  htmlFor="guestbook-photo"
                  className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Camera className="w-8 h-8" />
                  <span>Ajouter une photo</span>
                  <span className="text-xs">PNG, JPG jusqu'à 5MB</span>
                </Label>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isSubmitting ? "Ajout en cours..." : "Ajouter au livre d'or"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GuestbookForm;