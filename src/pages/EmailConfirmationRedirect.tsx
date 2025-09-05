import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EmailConfirmationRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (type === 'signup') {
          if (token_hash) {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash,
              type: 'signup'
            });

            if (error) {
              console.error('Confirmation error:', error);
              setStatus('error');
              setMessage('Erreur lors de la confirmation de votre compte. Le lien a peut-être expiré.');
              toast.error('Erreur de confirmation');
            } else {
              setStatus('success');
              setMessage('Votre compte a été confirmé avec succès ! Vous pouvez maintenant vous connecter.');
              toast.success('Compte confirmé avec succès !');
              
              // Redirect to login after 3 seconds
              setTimeout(() => {
                navigate('/auth', { 
                  state: { 
                    message: 'Compte confirmé ! Vous pouvez maintenant vous connecter.',
                    defaultTab: 'login'
                  }
                });
              }, 3000);
            }
          } else {
            setStatus('error');
            setMessage('Token de confirmation manquant.');
          }
        } else {
          // Handle other types of confirmations if needed
          setStatus('error');
          setMessage('Type de confirmation non reconnu.');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('Une erreur inattendue s\'est produite.');
        toast.error('Erreur inattendue');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-accent animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-success" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmation en cours...';
      case 'success':
        return 'Confirmation réussie !';
      case 'error':
        return 'Erreur de confirmation';
      default:
        return '';
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth', { 
      state: { 
        message: status === 'success' ? 'Compte confirmé ! Vous pouvez maintenant vous connecter.' : undefined,
        defaultTab: 'login'
      }
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {getStatusTitle()}
          </CardTitle>
          <CardDescription>
            Confirmation de votre adresse email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>

          {status === 'success' && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success">
                🎉 Bienvenue dans Invitopia Mini ! Vous allez être redirigé vers la page de connexion dans quelques secondes.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Si le problème persiste, contactez notre support ou essayez de vous inscrire à nouveau.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {status === 'success' ? (
              <Button 
                onClick={handleGoToLogin}
                className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continuer vers la connexion
              </Button>
            ) : status === 'error' ? (
              <>
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
                >
                  Aller à la connexion
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  Retour à l'accueil
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Veuillez patienter pendant la confirmation...
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Invitopia Mini - Gestion d'événements simplifiée
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmationRedirect;