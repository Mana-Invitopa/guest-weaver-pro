import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
}

const QRCodeGenerator = ({ 
  data, 
  size = 200, 
  title = "QR Code", 
  description = "Scannez ce code pour accéder rapidement" 
}: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple QR Code generator using a basic matrix pattern
  // In production, you'd use a proper QR code library like 'qrcode'
  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Create a simple QR-like pattern (placeholder)
    // In production, use a proper QR code library
    const moduleSize = size / 25; // 25x25 grid
    ctx.fillStyle = '#000000';

    // Generate a pattern based on the data
    const pattern = generatePattern(data, 25);
    
    for (let y = 0; y < 25; y++) {
      for (let x = 0; x < 25; x++) {
        if (pattern[y][x]) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, 18 * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, 18 * moduleSize, moduleSize);
    
  }, [data, size]);

  const generatePattern = (data: string, gridSize: number): boolean[][] => {
    const pattern: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    
    // Simple hash-based pattern generation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash + data.charCodeAt(i)) & 0xffffffff;
    }
    
    // Fill pattern based on hash
    for (let y = 3; y < gridSize - 3; y++) {
      for (let x = 3; x < gridSize - 3; x++) {
        // Skip finder pattern areas
        if ((x < 9 && y < 9) || 
            (x > gridSize - 10 && y < 9) || 
            (x < 9 && y > gridSize - 10)) continue;
        
        pattern[y][x] = (hash + x * 31 + y * 37) % 2 === 0;
      }
    }
    
    return pattern;
  };

  const drawFinderPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Draw 7x7 finder pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-accent" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="p-4 border-2 border-dashed border-border rounded-lg bg-background">
            <canvas 
              ref={canvasRef}
              className="block"
              style={{ 
                imageRendering: 'pixelated',
                width: `${size}px`,
                height: `${size}px`
              }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={downloadQRCode}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center break-all p-2 bg-muted rounded">
          <strong>Données:</strong> {data}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;