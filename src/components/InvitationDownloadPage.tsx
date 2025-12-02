import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Clock, 
  User,
  Sparkles,
  Check,
  Mail,
  MessageCircle,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface InvitationDownloadPageProps {
  event: {
    id: string;
    title: string;
    date_time: string;
    location: string;
    background_image_url?: string | null;
    event_type?: string | null;
    description?: string | null;
  };
  invitee: {
    id: string;
    name: string;
    email: string;
    token: string;
    table_name?: string | null;
  };
  pdfHtml?: string;
  onClose?: () => void;
}

const InvitationDownloadPage = ({ event, invitee, pdfHtml, onClose }: InvitationDownloadPageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Animate entry
    const timer = setTimeout(() => setIsVisible(true), 100);
    // Hide confetti after animation
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (!pdfHtml) {
      toast.error("Le PDF n'est pas encore prêt");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Create a Blob from the HTML content
      const blob = new Blob([pdfHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invitation-${event.title.replace(/\s+/g, '-').toLowerCase()}-${invitee.name.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloadProgress(100);
        setIsDownloading(false);
        toast.success("Invitation téléchargée avec succès !");
      }, 1200);
    } catch (error) {
      clearInterval(progressInterval);
      setIsDownloading(false);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShareWhatsApp = () => {
    const invitationUrl = `${window.location.origin}/invitation/${invitee.token}`;
    const message = encodeURIComponent(
      `🎉 J'ai confirmé ma présence à "${event.title}" !\n\n📅 ${format(new Date(event.date_time), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}\n📍 ${event.location}\n\nVoir mon invitation: ${invitationUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareTelegram = () => {
    const invitationUrl = `${window.location.origin}/invitation/${invitee.token}`;
    const message = encodeURIComponent(
      `🎉 J'ai confirmé ma présence à "${event.title}" !\n📅 ${format(new Date(event.date_time), 'EEEE d MMMM yyyy', { locale: fr })}\n📍 ${event.location}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(invitationUrl)}&text=${message}`, '_blank');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/80 to-secondary/90 backdrop-blur-sm">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-pulse"
              style={{
                width: Math.random() * 20 + 10,
                height: Math.random() * 20 + 10,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Confetti animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB'][Math.floor(Math.random() * 5)],
                  animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Card */}
      <Card className={`relative max-w-lg w-full bg-card/95 backdrop-blur-xl shadow-2xl border-0 overflow-hidden transform transition-all duration-700 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        {/* Decorative top bar */}
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent" />
        
        {/* Success Animation Header */}
        <div className="relative pt-8 pb-4 px-6 text-center">
          {/* Animated checkmark */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className={`absolute inset-0 rounded-full bg-success/20 transition-transform duration-500 ${isVisible ? 'scale-100' : 'scale-0'}`} />
            <div className={`absolute inset-2 rounded-full bg-success/40 transition-transform duration-700 delay-200 ${isVisible ? 'scale-100' : 'scale-0'}`} />
            <div className={`absolute inset-4 rounded-full bg-success flex items-center justify-center transition-transform duration-1000 delay-300 ${isVisible ? 'scale-100' : 'scale-0'}`}>
              <Check className="w-8 h-8 text-success-foreground" />
            </div>
            {/* Sparkles */}
            <Sparkles className={`absolute -top-2 -right-2 w-6 h-6 text-accent transition-all duration-500 delay-700 ${isVisible ? 'opacity-100 rotate-0' : 'opacity-0 rotate-45'}`} />
            <Sparkles className={`absolute -bottom-1 -left-2 w-5 h-5 text-warning transition-all duration-500 delay-900 ${isVisible ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
          </div>

          <h2 className={`text-2xl font-bold text-foreground mb-2 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Présence Confirmée ! 🎉
          </h2>
          <p className={`text-muted-foreground transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Merci <span className="font-semibold text-foreground">{invitee.name}</span>, votre participation est enregistrée
          </p>
        </div>

        {/* Event Preview Card */}
        <div className={`mx-6 mb-4 rounded-xl overflow-hidden shadow-lg transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {event.background_image_url && (
            <div className="relative h-32">
              <img 
                src={event.background_image_url} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge className="absolute top-3 left-3 bg-white/90 text-foreground">
                {event.event_type || 'Événement'}
              </Badge>
            </div>
          )}
          <div className={`p-4 bg-muted/50 ${!event.background_image_url ? 'pt-6' : ''}`}>
            <h3 className="font-bold text-lg text-foreground mb-3">{event.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{format(new Date(event.date_time), 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-accent" />
                <span>{format(new Date(event.date_time), 'HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent" />
                <span>{event.location}</span>
              </div>
              {invitee.table_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4 text-accent" />
                  <span>Table: <span className="font-semibold text-foreground">{invitee.table_name}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className={`px-6 pb-6 space-y-4 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Download Button with Progress */}
          <div className="relative">
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading || !pdfHtml}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {isDownloading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Téléchargement {downloadProgress}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Télécharger mon Invitation PDF</span>
                </div>
              )}
            </Button>
            {isDownloading && (
              <div className="absolute bottom-0 left-0 h-1 bg-success transition-all duration-300 rounded-b-lg" style={{ width: `${downloadProgress}%` }} />
            )}
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              className="flex-col h-auto py-3 gap-2 hover:bg-success/10 hover:border-success/50 hover:text-success transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleShareTelegram}
              className="flex-col h-auto py-3 gap-2 hover:bg-accent/10 hover:border-accent/50 hover:text-accent transition-all duration-300"
            >
              <Send className="w-5 h-5" />
              <span className="text-xs">Telegram</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const url = `${window.location.origin}/invitation/${invitee.token}`;
                navigator.clipboard.writeText(url);
                toast.success("Lien copié !");
              }}
              className="flex-col h-auto py-3 gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-xs">Copier</span>
            </Button>
          </div>

          {/* Email notice */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 text-sm">
            <Mail className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="text-muted-foreground">
              Un email avec votre invitation a été envoyé à <span className="font-medium text-foreground">{invitee.email}</span>
            </span>
          </div>

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Fermer
            </Button>
          )}
        </div>
      </Card>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InvitationDownloadPage;
