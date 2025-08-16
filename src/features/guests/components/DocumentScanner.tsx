import { useState, useCallback, useRef } from 'react';
import { Camera, Upload, Scan, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errorHandling';

interface ExtractedData {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expiry?: string;
  document_issuing_country?: string;
  confidence?: number;
}

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedData) => void;
  documentType?: 'passport' | 'id_card' | 'driving_license';
}

export function DocumentScanner({ onDataExtracted, documentType = 'passport' }: DocumentScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passeport';
      case 'id_card': return 'Carte d\'identité';
      case 'driving_license': return 'Permis de conduire';
      default: return 'Document';
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Impossible d\'accéder à la caméra. Veuillez utiliser l\'option de téléchargement.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            processImage(reader.result as string);
          }
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        processImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageData: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('scan-document', {
        body: {
          imageData,
          documentType
        }
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors du scan du document');
      }

      if (data?.success) {
        setExtractedData(data.data);
        toast.success('Document scanné avec succès');
      } else {
        throw new Error(data?.error || 'Erreur lors du traitement du document');
      }
    } catch (error: unknown) {
      console.error('Error scanning document:', error);
      setError(getErrorMessage(error) || 'Erreur lors du scan du document');
      toast.error('Erreur lors du scan du document');
    } finally {
      setIsScanning(false);
    }
  };

  const applyExtractedData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      toast.success('Données appliquées au formulaire');
    }
  };

  const clearResults = () => {
    setExtractedData(null);
    setError(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Scanner {getDocumentTypeLabel(documentType)}
        </CardTitle>
        <CardDescription>
          Utilisez votre caméra ou téléchargez une image pour extraire automatiquement les informations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showCamera && !extractedData && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              className="flex-1 gap-2"
            >
              <Camera className="h-4 w-4" />
              Prendre une photo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 gap-2"
            >
              <Upload className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {showCamera && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              <Button onClick={capturePhoto} className="gap-2">
                <Camera className="h-4 w-4" />
                Capturer
              </Button>
              <Button variant="outline" onClick={stopCamera} className="gap-2">
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {isScanning && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Analyse du document en cours...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Données extraites</h4>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  Confiance: {Math.round((extractedData.confidence || 0.5) * 100)}%
                </Badge>
                <Button size="sm" variant="outline" onClick={clearResults}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {extractedData.first_name && (
                <div>
                  <span className="font-medium">Prénom:</span> {extractedData.first_name}
                </div>
              )}
              {extractedData.last_name && (
                <div>
                  <span className="font-medium">Nom:</span> {extractedData.last_name}
                </div>
              )}
              {extractedData.date_of_birth && (
                <div>
                  <span className="font-medium">Naissance:</span> {extractedData.date_of_birth}
                </div>
              )}
              {extractedData.nationality && (
                <div>
                  <span className="font-medium">Nationalité:</span> {extractedData.nationality}
                </div>
              )}
              {extractedData.document_number && (
                <div>
                  <span className="font-medium">N° Document:</span> {extractedData.document_number}
                </div>
              )}
              {extractedData.document_expiry && (
                <div>
                  <span className="font-medium">Expiration:</span> {extractedData.document_expiry}
                </div>
              )}
            </div>

            <Button onClick={applyExtractedData} className="w-full gap-2">
              <Check className="h-4 w-4" />
              Appliquer ces données au formulaire
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}