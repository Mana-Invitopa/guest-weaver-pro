import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
  isActive: boolean;
}

const QRScanner = ({ onScanSuccess, onClose, isActive }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive && !stream) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Utilise la caméra arrière sur mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Erreur de caméra",
        description: "Impossible d'accéder à la caméra. Vérifiez les permissions.",
        variant: "destructive",
      });
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple pattern detection (looking for potential QR code patterns)
    // In a real implementation, you'd use a QR code detection library like jsQR
    const data = detectQRPattern(imageData);
    
    if (data) {
      onScanSuccess(data);
      setScanning(false);
      return;
    }

    // Continue scanning
    if (scanning) {
      requestAnimationFrame(scanFrame);
    }
  };

  const detectQRPattern = (imageData: ImageData): string | null => {
    // Simplified QR detection - in reality you'd use jsQR library
    // For demo purposes, we'll simulate detection after a few seconds
    const currentTime = Date.now();
    const scanStartTime = currentTime - 3000; // 3 seconds ago
    
    // Simulate successful scan with a fake token
    if (Math.random() > 0.95) { // 5% chance per frame
      return "demo_invitation_token_12345";
    }
    
    return null;
  };

  useEffect(() => {
    if (scanning && videoRef.current?.readyState === 4) {
      scanFrame();
    }
  }, [scanning]);

  const handleVideoLoaded = () => {
    if (scanning) {
      scanFrame();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
    onClose();
  };

  if (!isActive) return null;

  return (
    <Card className="fixed inset-4 z-50 bg-background shadow-lg">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scanner QR Code</h3>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedData={handleVideoLoaded}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay with scanning frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-accent rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
              
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-accent animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Pointez la caméra vers le QR code</p>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Assurez-vous que le QR code soit bien visible et éclairé
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;