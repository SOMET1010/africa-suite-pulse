import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TouchButton } from './TouchButton';
import { cn } from '@/lib/utils';
import { RotateCcw, Check, X, Edit3 } from 'lucide-react';

interface DigitalSignatureProps {
  onSignatureComplete: (signature: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  className?: string;
}

export function DigitalSignature({
  onSignatureComplete,
  onCancel,
  placeholder = "Signez ici",
  width = 400,
  height = 200,
  strokeColor = "#2563eb",
  strokeWidth = 2,
  backgroundColor = "#ffffff",
  className
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Configure drawing context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }, [width, height, strokeColor, strokeWidth, backgroundColor]);

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const position = getEventPosition(e);
    setLastPosition(position);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !lastPosition) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const currentPosition = getEventPosition(e);

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();

    setLastPosition(currentPosition);
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const dataURL = canvas.toDataURL('image/png');
    onSignatureComplete(dataURL);
  };

  // Prevent scrolling when drawing on mobile
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', preventDefault, { passive: false });
      canvas.addEventListener('touchmove', preventDefault, { passive: false });
      canvas.addEventListener('touchend', preventDefault, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', preventDefault);
        canvas.removeEventListener('touchmove', preventDefault);
        canvas.removeEventListener('touchend', preventDefault);
      }
    };
  }, []);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Signature Numérique
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Canvas Container */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={cn(
              "border border-border rounded-lg cursor-crosshair w-full touch-none",
              "bg-white shadow-inner"
            )}
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          
          {/* Placeholder */}
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                {placeholder}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground text-center bg-soft-muted p-2 rounded">
          Utilisez votre doigt ou votre stylet pour signer dans la zone ci-dessus
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <TouchButton
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Effacer
          </TouchButton>

          {onCancel && (
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </TouchButton>
          )}

          <TouchButton
            variant="primary"
            size="sm"
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Valider
          </TouchButton>
        </div>

        {/* Signature Info */}
        {hasSignature && (
          <div className="text-xs text-success text-center bg-soft-success p-2 rounded">
            ✓ Signature prête à être validée
          </div>
        )}
      </CardContent>
    </Card>
  );
}