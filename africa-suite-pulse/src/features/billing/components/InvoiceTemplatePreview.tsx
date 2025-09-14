// Composant de prévisualisation des modèles de factures
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TButton } from "@/core/ui/TButton";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  isDefault: boolean;
}

interface InvoiceTemplatePreviewProps {
  templateId: string;
  template: InvoiceTemplate;
  onClose: () => void;
}

export function InvoiceTemplatePreview({ templateId, template, onClose }: InvoiceTemplatePreviewProps) {
  const getSampleInvoiceData = () => {
    return {
      hotelName: "Hôtel de Luxe",
      hotelAddress: "123 Avenue des Champs, 75008 Paris",
      hotelPhone: "+33 1 23 45 67 89",
      hotelEmail: "contact@hoteldeluxe.fr",
      invoiceNumber: "FAC-2024-001234",
      invoiceDate: "15 Janvier 2024",
      dueDate: "30 Janvier 2024",
      guestName: "Monsieur Jean Dupont",
      guestAddress: "45 Rue de la Paix, 75001 Paris",
      guestEmail: "jean.dupont@email.fr",
      guestPhone: "+33 6 12 34 56 78",
      roomNumber: "Suite 205",
      checkIn: "12 Janvier 2024",
      checkOut: "15 Janvier 2024",
      nights: 3,
      services: [
        { description: "Hébergement - Suite Deluxe", quantity: 3, unitPrice: 350, total: 1050 },
        { description: "Petit-déjeuner Continental", quantity: 6, unitPrice: 25, total: 150 },
        { description: "Parking Privé", quantity: 3, unitPrice: 20, total: 60 },
        { description: "Service de Conciergerie", quantity: 1, unitPrice: 50, total: 50 }
      ],
      subtotal: 1310,
      taxRate: 20,
      taxAmount: 262,
      total: 1572
    };
  };

  const renderStandardTemplate = () => {
    const data = getSampleInvoiceData();
    
    return (
      <div className="bg-white p-8 text-black max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="border-b-2 border-primary pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">{data.hotelName}</h1>
              <p className="text-sm text-gray-600 mt-1">{data.hotelAddress}</p>
              <p className="text-sm text-gray-600">{data.hotelPhone} • {data.hotelEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">FACTURE</h2>
              <p className="text-lg font-semibold text-primary">{data.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Informations facture et client */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-3">Facturé à :</h3>
            <div className="text-sm">
              <p className="font-semibold">{data.guestName}</p>
              <p>{data.guestAddress}</p>
              <p>{data.guestEmail}</p>
              <p>{data.guestPhone}</p>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-3">Détails du séjour :</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Chambre :</span> {data.roomNumber}</p>
              <p><span className="font-medium">Arrivée :</span> {data.checkIn}</p>
              <p><span className="font-medium">Départ :</span> {data.checkOut}</p>
              <p><span className="font-medium">Nuitées :</span> {data.nights}</p>
            </div>
          </div>
        </div>

        {/* Tableau des services */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Description</th>
                <th className="border border-gray-300 p-3 text-center">Qté</th>
                <th className="border border-gray-300 p-3 text-right">Prix Unit.</th>
                <th className="border border-gray-300 p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((service, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-3">{service.description}</td>
                  <td className="border border-gray-300 p-3 text-center">{service.quantity}</td>
                  <td className="border border-gray-300 p-3 text-right">{service.unitPrice}€</td>
                  <td className="border border-gray-300 p-3 text-right font-semibold">{service.total}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Sous-total :</span>
              <span>{data.subtotal}€</span>
            </div>
            <div className="flex justify-between py-2">
              <span>TVA ({data.taxRate}%) :</span>
              <span>{data.taxAmount}€</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-primary font-bold text-lg">
              <span>Total TTC :</span>
              <span className="text-primary">{data.total}€</span>
            </div>
          </div>
        </div>

        {/* Conditions de paiement */}
        <div className="border-t pt-6 text-sm text-gray-600">
          <h4 className="font-bold mb-2">Conditions de paiement :</h4>
          <p>Règlement à 15 jours. En cas de retard, des pénalités de 3% par mois seront appliquées.</p>
          <p className="mt-2">Merci de votre confiance et de votre séjour dans notre établissement.</p>
        </div>
      </div>
    );
  };

  const renderLuxuryTemplate = () => {
    const data = getSampleInvoiceData();
    
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white p-8 text-black max-w-2xl mx-auto">
        {/* En-tête premium avec bordure dorée */}
        <div className="border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 mb-8 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-amber-900">{data.hotelName}</h1>
              <p className="text-amber-700 mt-2 italic">Excellence & Prestige</p>
              <p className="text-sm text-amber-600 mt-1">{data.hotelAddress}</p>
            </div>
            <div className="text-right border-l-2 border-amber-400 pl-6">
              <h2 className="text-2xl font-bold text-amber-900">FACTURE</h2>
              <p className="text-xl font-bold text-amber-700">{data.invoiceNumber}</p>
              <p className="text-sm text-amber-600">{data.invoiceDate}</p>
            </div>
          </div>
        </div>

        {/* Contenu similaire mais avec styling premium */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-bold text-amber-900 mb-3">Client Privilégié :</h3>
              <div className="text-sm text-amber-800">
                <p className="font-semibold">{data.guestName}</p>
                <p>{data.guestAddress}</p>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-bold text-amber-900 mb-3">Détails du séjour :</h3>
              <div className="text-sm text-amber-800 space-y-1">
                <p><span className="font-medium">Suite :</span> {data.roomNumber}</p>
                <p><span className="font-medium">Période :</span> {data.checkIn} - {data.checkOut}</p>
              </div>
            </div>
          </div>

          {/* Total en évidence */}
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg border-2 border-amber-300">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-amber-900">Total de votre séjour</h3>
              <p className="text-4xl font-bold text-amber-700 mt-2">{data.total}€</p>
              <p className="text-amber-600 text-sm mt-1">TVA incluse</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMinimalTemplate = () => {
    const data = getSampleInvoiceData();
    
    return (
      <div className="bg-white p-8 text-gray-900 max-w-2xl mx-auto font-light">
        {/* En-tête minimaliste */}
        <div className="flex justify-between items-end pb-8 mb-8 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-light tracking-wide">{data.hotelName}</h1>
            <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">{data.hotelAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Facture</p>
            <p className="text-xl font-light">{data.invoiceNumber}</p>
          </div>
        </div>

        {/* Informations épurées */}
        <div className="grid grid-cols-3 gap-8 mb-12 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Client</p>
            <p className="font-medium">{data.guestName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Période</p>
            <p>{data.checkIn} — {data.checkOut}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Chambre</p>
            <p>{data.roomNumber}</p>
          </div>
        </div>

        {/* Services en liste épurée */}
        <div className="mb-12">
          {data.services.map((service, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-sm">{service.description}</p>
                <p className="text-xs text-gray-500">{service.quantity} × {service.unitPrice}€</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{service.total}€</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total minimaliste */}
        <div className="text-right">
          <div className="inline-block text-left">
            <div className="flex justify-between gap-12 py-1">
              <span className="text-sm text-gray-500">Sous-total</span>
              <span className="text-sm">{data.subtotal}€</span>
            </div>
            <div className="flex justify-between gap-12 py-1">
              <span className="text-sm text-gray-500">TVA</span>
              <span className="text-sm">{data.taxAmount}€</span>
            </div>
            <div className="flex justify-between gap-12 py-3 border-t border-gray-200">
              <span className="font-medium">Total</span>
              <span className="font-medium text-lg">{data.total}€</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTemplate = () => {
    switch (templateId) {
      case "luxury":
        return renderLuxuryTemplate();
      case "minimal":
        return renderMinimalTemplate();
      case "standard":
      default:
        return renderStandardTemplate();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl">{template.name}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{template.category}</Badge>
              {template.isDefault && (
                <Badge variant="default">Par défaut</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <TButton variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Personnaliser
            </TButton>
            <TButton size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Utiliser ce modèle
            </TButton>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="transform scale-75 origin-top">
                {renderTemplate()}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}