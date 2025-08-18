import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/unified-toast";
import { QRCodeSVG } from "qrcode.react";

interface FNEQRCodeProps {
  qrCode: string;
  invoiceId: string;
  referenceNumber: string;
  orderNumber: string;
}

export const FNEQRCode = ({ qrCode, invoiceId, referenceNumber, orderNumber }: FNEQRCodeProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papiers`,
      variant: "success",
    });
  };

  const openQRUrl = () => {
    window.open(qrCode, '_blank');
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          QR FNE
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Code QR FNE - {orderNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCodeSVG 
              value={qrCode}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
          
          {/* Informations FNE */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                ID Facture FNE
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                  {invoiceId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(invoiceId, "ID Facture")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Référence DGI
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
                  {referenceNumber}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(referenceNumber, "Référence")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                URL de Vérification
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono truncate">
                  {qrCode}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(qrCode, "URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openQRUrl}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => copyToClipboard(qrCode, "URL de vérification")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier URL
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={openQRUrl}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Vérifier
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Ce QR code permet de vérifier l'authenticité de la facture sur le site de la DGI
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};