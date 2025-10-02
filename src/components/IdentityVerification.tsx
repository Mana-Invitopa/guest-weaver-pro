import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface IdentityVerification {
  id: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  document_type: 'national_id' | 'passport' | 'driver_license';
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  submitted_at: string;
  rejection_reason?: string;
}

export default function IdentityVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState<'national_id' | 'passport' | 'driver_license'>('national_id');
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: verification, isLoading } = useQuery({
    queryKey: ['identity-verification', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as IdentityVerification | null;
    },
    enabled: !!user?.id,
  });

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${path}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!documentFront || !selfie) {
        throw new Error("Document et selfie requis");
      }

      setUploading(true);
      try {
        const frontUrl = await uploadFile(documentFront, 'document_front');
        const backUrl = documentBack ? await uploadFile(documentBack, 'document_back') : null;
        const selfieUrl = await uploadFile(selfie, 'selfie');

        const { error } = await supabase
          .from('identity_verifications')
          .insert({
            user_id: user?.id,
            document_type: documentType,
            document_front_url: frontUrl,
            document_back_url: backUrl,
            selfie_url: selfieUrl,
          });

        if (error) throw error;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-verification'] });
      toast.success("Vérification d'identité soumise avec succès");
      setDocumentFront(null);
      setDocumentBack(null);
      setSelfie(null);
    },
    onError: (error) => {
      toast.error("Erreur lors de la soumission: " + error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-white"><CheckCircle className="w-3 h-3 mr-1" /> Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (verification) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vérification d'identité</CardTitle>
              <CardDescription>Statut de votre vérification d'identité</CardDescription>
            </div>
            {getStatusBadge(verification.verification_status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type de document</p>
              <p className="font-medium">
                {verification.document_type === 'national_id' && 'Carte d\'identité'}
                {verification.document_type === 'passport' && 'Passeport'}
                {verification.document_type === 'driver_license' && 'Permis de conduire'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Date de soumission</p>
              <p className="font-medium">{new Date(verification.submitted_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          {verification.verification_status === 'rejected' && verification.rejection_reason && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Raison du rejet</p>
                  <p className="text-sm text-muted-foreground">{verification.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}

          {verification.verification_status === 'pending' && (
            <div className="p-4 bg-secondary/20 border border-secondary rounded-lg">
              <p className="text-sm">Votre vérification est en cours d'examen. Vous serez notifié une fois qu'elle sera traitée.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Vérification d'identité</CardTitle>
        <CardDescription>
          Soumettez vos documents pour vérifier votre identité en tant qu'organisateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Type de document</Label>
          <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
              <SelectItem value="passport">Passeport</SelectItem>
              <SelectItem value="driver_license">Permis de conduire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Document (recto) *</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDocumentFront(e.target.files?.[0] || null)}
              className="hidden"
              id="document-front"
            />
            <label htmlFor="document-front" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {documentFront ? documentFront.name : "Cliquez pour télécharger le recto"}
              </p>
            </label>
          </div>
        </div>

        {documentType !== 'passport' && (
          <div className="space-y-2">
            <Label>Document (verso)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDocumentBack(e.target.files?.[0] || null)}
                className="hidden"
                id="document-back"
              />
              <label htmlFor="document-back" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {documentBack ? documentBack.name : "Cliquez pour télécharger le verso"}
                </p>
              </label>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Selfie avec le document *</Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              className="hidden"
              id="selfie"
            />
            <label htmlFor="selfie" className="cursor-pointer">
              <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {selfie ? selfie.name : "Prenez un selfie tenant votre document"}
              </p>
            </label>
          </div>
        </div>

        <div className="p-4 bg-secondary/20 border border-secondary rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> Assurez-vous que votre visage et les informations sur le document sont clairement visibles sur le selfie.
          </p>
        </div>

        <Button
          onClick={() => submitVerification.mutate()}
          disabled={!documentFront || !selfie || uploading}
          className="w-full bg-gradient-primary"
        >
          {uploading ? "Envoi en cours..." : "Soumettre la vérification"}
        </Button>
      </CardContent>
    </Card>
  );
}
