import React, { useMemo, useEffect, useCallback } from "react";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { useRackDataModern } from "./useRackDataModern";
import { useReassignReservation } from "@/queries/rack.queries";
import { useRackState } from "./hooks/useRackState";
import { useRackActions } from "./hooks/useRackActions";
import RackToolbar from "./components/RackToolbar";
import { RackStatusBar } from "./RackStatusBar";
import RoomDetailSheet from "./components/RoomDetailSheet";
import { NewConflictDialog } from "./components/NewConflictDialog";
import { MoveConfirmationDialog } from "./components/MoveConfirmationDialog";
import { ManualRelodgeDialog } from "./components/ManualRelodgeDialog";
import { TariffConfirmationModal } from "./components/TariffConfirmationModal";
import { toast } from "@/hooks/use-toast";
import { TButton } from "@/core/ui/TButton";
import { logger } from "@/lib/logger";
import { RefreshCw, Plus } from "lucide-react";

// Simple styles pour drag & drop
const dragDropStyles = `
.reservation-card:hover {
  transform: scale(1.02);
}
.reservation-card:active {
  transform: scale(0.98);
  opacity: 0.7;
}
.room-cell.drag-over-valid {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}
.room-cell.drag-over-invalid {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgb(239, 68, 68);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
`;
import { ModernRackGrid } from "./components/ModernRackGrid";
import { useOrgId } from "@/core/auth/useOrg";
import { invalidateRackQueries } from "@/lib/queryClient";

// Types pour les données transformées
interface DayData {
  date: string;
  dayName: string;
  dayNumber: string;
}

export default function RackGrid() {
  // 🆕 UTILISATION DU NOUVEAU HOOK AVEC REACT QUERY
  const { data, kpis, loading, error, refetch, isRefetching } = useRackDataModern();
  const reassignMutation = useReassignReservation();
  const { orgId } = useOrgId();
  const {
    zoom, setZoom,
    query, setQuery,
    statusFilter, setStatusFilter,
    compact, setCompact,
    vivid, setVivid,
    detailSheet, setDetailSheet,
    conflictDialog, setConflictDialog,
    moveConfirmDialog, setMoveConfirmDialog,
    manualRelodgeDialog, setManualRelodgeDialog,
  } = useRackState();

  // Add tariff confirmation state
  const [showTariffConfirmation, setShowTariffConfirmation] = React.useState(false);
  const [tariffConfirmationData, setTariffConfirmationData] = React.useState<any>(null);

  const {
    handleConflict,
    closeConflictDialog,
    doSwap,
    doAutoRelodge,
    doConfirmRelodge,
    closeManualRelodgeDialog,
    confirmManualRelodge
  } = useRackActions({
    data,
    conflictDialog,
    setConflictDialog,
    setDetailSheet,
    setMoveConfirmDialog,
    setManualRelodgeDialog
  });

  // 🆕 GESTION MODERNISÉE DU DÉPLACEMENT AVEC REACT QUERY ET VALIDATION + DEBUG
  const handleReservationMove = useCallback(async (reservationId: string, targetRoomId: string, targetDay: string) => {
    logger.debug('handleReservationMove appelé', {
      reservationId,
      targetRoomId,
      targetDay,
      hasData: !!data,
      reservationsCount: data?.reservations.length
    });

    // 🔍 VALIDATION AVANT DÉPLACEMENT
    const reservation = data?.reservations.find(r => r.id === reservationId);
    logger.debug('Réservation trouvée', { reservation });
    
    const validation = validateMove(reservation, targetRoomId);
    logger.debug('Résultat validation', { validation });
    
    if (!validation.isValid) {
      logger.warn('Validation échouée', { reason: validation.reason });
      toast({ 
        title: "❌ Déplacement impossible", 
        description: validation.reason,
        variant: "destructive" 
      });
      return;
    }

    logger.info('Validation réussie, lancement de la mutation');
    try {
      logger.debug('Avant mutation', { reservationId, roomId: targetRoomId });
      await reassignMutation.mutateAsync({ reservationId, roomId: targetRoomId });
      logger.info('Mutation réussie, invalidation des queries');
      
      // 🔄 INVALIDATION DES QUERIES POUR FORCER LA MISE À JOUR
      if (orgId) {
        logger.debug('Invalidation avec orgId', { orgId });
        invalidateRackQueries(orgId);
        logger.debug('Queries invalidées');
      } else {
        logger.warn('Pas d\'orgId pour l\'invalidation');
      }
      
      toast({ 
        title: "✅ Réservation déplacée", 
        description: `Chambre ${targetRoomId}`,
      });
    } catch (error: any) {
      logger.error('Erreur mutation', error);
      
      // Afficher un message utilisateur convivial basé sur le type d'erreur
      let userMessage = "Impossible de déplacer la réservation";
      
      if (error.code === "23514" && error.message?.includes("Conflicting reservation")) {
        userMessage = "Des réservations en conflit empêchent ce déplacement. Utilisez la gestion des conflits pour résoudre cette situation.";
      } else if (error.userMessage) {
        userMessage = error.userMessage;
      } else if (error.message) {
        // Traduire d'autres messages techniques courants
        if (error.message.includes("permission denied")) {
          userMessage = "Vous n'avez pas les permissions nécessaires pour cette action";
        } else if (error.message.includes("network")) {
          userMessage = "Problème de connexion réseau. Veuillez réessayer.";
        }
      }
      
      toast({ 
        title: "❌ Déplacement impossible", 
        description: userMessage, 
        variant: "destructive" 
      });
    }
  }, [reassignMutation, orgId, data?.reservations]);

  // 🧪 DEBUG: Vérifications supplémentaires
  useEffect(() => {
    logger.debug('Données rack changées', {
      reservationsCount: data?.reservations.length,
      loading,
      isRefetching,
      orgId
    });
  }, [data, loading, isRefetching, orgId]);

  // Injection des styles CSS simplifiés
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = dragDropStyles;
    document.head.appendChild(styleSheet);
    return () => { if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); };
  }, []);

  // expose read-only data for validation util (évite de propager 1000 props)
  useEffect(() => { 
    if (data) {
      (window as any).__RACK_DATA__ = data; 
    }
  }, [data]);

  // 🆕 FONCTION DE VALIDATION : Vérifie si le déplacement est valide
  function validateMove(reservation: any, targetRoomId: string): { isValid: boolean; reason?: string } {
    if (!reservation || !targetRoomId) {
      return { isValid: false, reason: "Données manquantes" };
    }

    // Vérification principale : même chambre
    if (reservation.roomId === targetRoomId) {
      return { 
        isValid: false, 
        reason: "La réservation est déjà dans cette chambre" 
      };
    }

    // Vérification de l'existence de la chambre cible
    const targetRoom = data?.rooms.find(r => r.id === targetRoomId);
    if (!targetRoom) {
      return { 
        isValid: false, 
        reason: "Chambre de destination introuvable" 
      };
    }

    // Vérification du statut de la chambre (optionnel)
    if (targetRoom.status === 'out_of_order') {
      return { 
        isValid: false, 
        reason: "Chambre hors service" 
      };
    }

    return { isValid: true };
  }

  // 🧪 TEST MANUEL - Pour vérifier que handleReservationMove fonctionne
  const testManualMove = () => {
    const testReservationId = "R-1003"; // Utilisez un ID réel de vos données
    const testTargetRoomId = "102"; // Utilisez un room ID différent de l'actuel
    
    logger.debug('Test manuel de handleReservationMove');
    handleReservationMove(testReservationId, testTargetRoomId, 'current');
  };



  // Gestion des handlers avec React Query
  const handleCheckin = useCallback(async (reservationId: string) => {
    try {
      toast({ title: "✅ Check-in effectué", description: "Client enregistré avec succès" });
      setDetailSheet(prev => ({ ...prev, open: false }));
      // React Query invalidera automatiquement le cache
    } catch (error) {
      toast({ title: "❌ Erreur", description: "Impossible d'effectuer le check-in", variant: "destructive" });
    }
  }, [setDetailSheet]);

  const handleNewReservation = useCallback((roomId: string, dayISO: string) => {
    toast({ title: "🆕 Nouvelle réservation", description: `Chambre ${roomId} - ${dayISO}` });
    setDetailSheet(prev => ({ ...prev, open: false }));
  }, [setDetailSheet]);

  const handleMoveConfirm = useCallback(async () => {
    const { pendingDrop } = moveConfirmDialog;
    if (pendingDrop) {
      await handleReservationMove(pendingDrop.resId, pendingDrop.roomId, 'current');
    }
    setMoveConfirmDialog({ open: false, reservation: null, sourceRoom: null, targetRoom: null, pendingDrop: null });
  }, [moveConfirmDialog, handleReservationMove, setMoveConfirmDialog]);
  
  const handleMoveCancel = useCallback(() => {
    setMoveConfirmDialog({ open: false, reservation: null, sourceRoom: null, targetRoom: null, pendingDrop: null });
  }, [setMoveConfirmDialog]);

  const filteredRooms = useMemo(() => {
    if (!data) return [];
    return data.rooms
      .filter(r => `${r.number} ${r.type}`.toLowerCase().includes(query.toLowerCase()))
      .filter(r => statusFilter === "all" || r.status === statusFilter);
  }, [data, query, statusFilter]);

  // 🆕 ÉTAT DE CHARGEMENT REACT QUERY
  if (loading) return <div className="p-8 text-center">Chargement du rack...</div>;
  if (error) return <div className="p-8 text-center text-destructive">Erreur: {error.message}</div>;
  if (!data) return null;

  return (
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Rack Hôtel</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm">Occ: {kpis.occ.toFixed(0)}%</span>
              <span>•</span>
              <span className="text-sm">{filteredRooms.length} chambres</span>
            </div>
          </div>
          <div className="flex gap-2">
            <TButton 
              onClick={() => setDetailSheet({ open: true, room: null, dayISO: new Date().toISOString().split('T')[0], reservation: undefined })}
              variant="primary"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle résa
            </TButton>
            <TButton 
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </TButton>
          </div>
        </div>

        {/* Rack Content */}
      <div className="page-enter">
        <main className="min-h-screen bg-pearl px-2 sm:px-4 lg:px-6 pt-8 sm:pt-12 pb-20 sm:pb-12 space-y-6 sm:space-y-8 animate-fade-in">
          <div className="container mx-auto">
        <RackToolbar
          onFilterStatus={setStatusFilter}
          onToggleCompact={setCompact}
          onZoom={setZoom}
          onVivid={setVivid}
          kpis={{
            occ: kpis.occ,
            arrivals: kpis.arrivals,
            presents: kpis.presents,
            availableRooms: data.rooms.filter(r => r.status === 'clean' || r.status === 'inspected').length,
            dailyRevenue: data.reservations
              .filter(r => {
                const today = new Date().toISOString().split('T')[0];
                return r.start === today || (r.start <= today && r.end > today);
              })
              .reduce((sum, r) => sum + (r.rate || 0), 0),
            issues: data.rooms.filter(r => r.status === 'dirty' || r.status === 'maintenance').length,
            departures: data.reservations.filter(r => {
              const today = new Date().toISOString().split('T')[0];
              return r.end === today && r.status !== 'cancelled';
            }).length,
            urgentActions: kpis.hs + data.rooms.filter(r => r.status === 'dirty' || r.status === 'maintenance' || r.status === 'out_of_order').length
          }}
          isRefetching={isRefetching}
          onRefresh={refetch}
        />

          <ModernRackGrid
            days={data.days.map(dateISO => ({ 
              date: dateISO, 
              dayName: new Date(dateISO).toLocaleDateString('fr-FR', { weekday: 'short' }), 
              dayNumber: new Date(dateISO).getDate().toString() 
            }))}
            filteredRooms={filteredRooms}
            reservations={data.reservations}
            compact={compact}
            vivid={vivid}
            zoom={zoom}
            onReservationMove={handleReservationMove}
            onCellClick={(room, day, reservation) => {
              if (reservation) {
                // Check if this is a tariff confirmation scenario (drag & drop with room type change)
                const currentRoom = data.rooms.find(r => r.id === reservation.roomId);
                const currentRoomType = currentRoom?.type || '';
                const targetRoomType = room.type || '';
                
                if (currentRoomType !== targetRoomType) {
                  if (currentRoom) {
                    setTariffConfirmationData({
                      reservation: {
                        id: reservation.id,
                        reference: reservation.id,
                        guest_name: reservation.guestName,
                        date_arrival: reservation.start,
                        date_departure: reservation.end,
                        adults: 1,
                        children: 0,
                        rate_total: reservation.rate || 0
                      },
                      currentRoom: {
                        number: currentRoom.number,
                        type: currentRoom.type
                      },
                      targetRoom: {
                        number: room.number,
                        type: room.type
                      },
                      moveData: {
                        reservationId: reservation.id,
                        targetRoomId: room.id,
                        targetDay: day
                      }
                    });
                    setShowTariffConfirmation(true);
                    return;
                  }
                }
              }
              
              setDetailSheet({ 
                open: true, 
                room, 
                dayISO: day, 
                reservation: reservation || null 
              });
            }}
          />

          

          <RoomDetailSheet
            open={detailSheet.open}
            onOpenChange={(open) => setDetailSheet(prev => ({ ...prev, open }))}
            room={detailSheet.room}
            dayISO={detailSheet.dayISO}
            reservation={detailSheet.reservation}
            onCheckin={handleCheckin}
            onNewReservation={handleNewReservation}
          />

          <NewConflictDialog
            open={conflictDialog.open}
            dragged={conflictDialog.dragged}
            targetRoom={data.rooms.find(r => r.id === conflictDialog.targetRoomId) || null}
            conflicts={conflictDialog.conflicts}
            preview={conflictDialog.preview}
            conflictType={conflictDialog.conflictType}
            allRooms={data.rooms}
            onCancel={closeConflictDialog}
            onSwap={doSwap}
            onAutoRelodge={doAutoRelodge}
            onConfirmRelodge={doConfirmRelodge}
          />

          <MoveConfirmationDialog
            open={moveConfirmDialog.open}
            onOpenChange={(open) => !open && handleMoveCancel()}
            reservation={moveConfirmDialog.reservation}
            sourceRoom={moveConfirmDialog.sourceRoom}
            targetRoom={moveConfirmDialog.targetRoom}
            onConfirm={handleMoveConfirm}
            onCancel={handleMoveCancel}
          />

          <ManualRelodgeDialog
            open={manualRelodgeDialog.open}
            sourceRoom={manualRelodgeDialog.sourceRoom}
            destinationRoom={manualRelodgeDialog.destinationRoom}
            conflicts={manualRelodgeDialog.conflicts}
            preview={manualRelodgeDialog.preview}
            onCancel={closeManualRelodgeDialog}
            onConfirm={confirmManualRelodge}
            onRestart={closeManualRelodgeDialog}
          />

          <TariffConfirmationModal
            isOpen={showTariffConfirmation}
            onClose={() => setShowTariffConfirmation(false)}
            onConfirm={() => {
              if (tariffConfirmationData?.moveData) {
                const { reservationId, targetRoomId, targetDay } = tariffConfirmationData.moveData;
                handleReservationMove(reservationId, targetRoomId, targetDay);
              }
            }}
            reservation={tariffConfirmationData?.reservation}
            currentRoom={tariffConfirmationData?.currentRoom}
            targetRoom={tariffConfirmationData?.targetRoom}
            orgId={orgId || ''}
          />

          </div>
        </main>
      </div>
      </div>
    </MainAppLayout>
  );
}