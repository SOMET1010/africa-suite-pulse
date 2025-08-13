import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { TButton } from "@/core/ui/TButton";
import { FilterBar } from "@/core/ui/FilterBar";
import { DataCard } from "@/core/ui/DataCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Plus, 
  Filter, 
  Euro,
  Receipt,
  ArrowLeftRight,
  Calendar,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CardexOverview } from "./components/CardexOverview";
import { FoliosGrid } from "./components/FoliosGrid";
import { CardexHistory } from "./components/CardexHistory";
import { QuickPostingDialog } from "./components/QuickPostingDialog";
import { ReservationSelector } from "./components/ReservationSelector";

export default function CardexPage() {
  const [searchParams] = useSearchParams();
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(
    searchParams.get('reservation') || null
  );
  const [quickPostingOpen, setQuickPostingOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "AfricaSuite PMS - Cardex";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Module Cardex - Gestion complète des comptes clients - AfricaSuite PMS");
  }, []);

  const handleQuickPosting = () => {
    if (!selectedReservationId) {
      toast({
        title: "Sélection requise",
        description: "Veuillez d'abord sélectionner une réservation",
        variant: "destructive"
      });
      return;
    }
    setQuickPostingOpen(true);
  };

  return (
    <UnifiedLayout
      title="Cardex"
      headerAction={
        <div className="flex gap-2">
          <TButton
            onClick={handleQuickPosting}
            disabled={!selectedReservationId}
            variant="secondary"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Passage rapide
          </TButton>
          <TButton
            onClick={() => setFilterDialogOpen(true)}
            variant="outline"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </TButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sélecteur de réservation */}
        <Card className="glass-card shadow-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-luxury">
              <User className="h-5 w-5" />
              Sélection réservation/client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationSelector
              selectedId={selectedReservationId}
              onSelect={setSelectedReservationId}
            />
          </CardContent>
        </Card>

        {selectedReservationId ? (
          <>
            {/* Aperçu du cardex */}
            <CardexOverview reservationId={selectedReservationId} />

            {/* Onglets principal */}
            <Tabs defaultValue="folios" className="space-y-6">
              <TabsList className="glass-card p-1">
                <TabsTrigger value="folios" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Folios
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Historique détaillé
                </TabsTrigger>
                <TabsTrigger value="transfers" className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Transferts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="folios">
                <FoliosGrid reservationId={selectedReservationId} />
              </TabsContent>

              <TabsContent value="history">
                <CardexHistory reservationId={selectedReservationId} />
              </TabsContent>

              <TabsContent value="transfers">
                <Card className="glass-card shadow-luxury">
                  <CardContent className="p-8 text-center">
                    <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-charcoal/30" />
                    <h3 className="text-lg font-luxury mb-2">Transferts entre folios</h3>
                    <p className="text-charcoal/70 mb-4">
                      Fonctionnalité de transfert entre folios en cours de développement
                    </p>
                    <TButton variant="outline" disabled>
                      Bientôt disponible
                    </TButton>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          /* État vide */
          <Card className="glass-card shadow-luxury">
            <CardContent className="p-12 text-center">
              <CreditCard className="h-20 w-20 mx-auto mb-6 text-charcoal/20" />
              <h3 className="text-2xl font-luxury mb-4 text-charcoal">
                Cardex - Gestion des comptes clients
              </h3>
              <p className="text-charcoal/70 mb-6 max-w-md mx-auto">
                Sélectionnez une réservation ci-dessus pour accéder au cardex complet 
                avec la gestion des 6 folios, l'historique des opérations et les paiements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-accent-gold/5 rounded-lg">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-accent-gold" />
                  <p className="text-sm font-medium">6 Folios complets</p>
                </div>
                <div className="p-4 bg-brand-accent/5 rounded-lg">
                  <Euro className="h-8 w-8 mx-auto mb-2 text-brand-accent" />
                  <p className="text-sm font-medium">Soldes temps réel</p>
                </div>
                <div className="p-4 bg-info/5 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-info" />
                  <p className="text-sm font-medium">Historique détaillé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <QuickPostingDialog
        open={quickPostingOpen}
        onOpenChange={setQuickPostingOpen}
        reservationId={selectedReservationId}
      />
    </UnifiedLayout>
  );
}