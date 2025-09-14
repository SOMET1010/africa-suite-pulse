import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { ArrowRight, AlertTriangle, Home, Users } from "lucide-react";
import type { UIRoom, UIReservation } from "../rack.types";

interface DelogementPreviewProps {
  visible: boolean;
  sourceReservation: UIReservation | null;
  targetRoom: UIRoom | null;
  conflicts: UIReservation[];
  suggestedRooms: UIRoom[];
  onConfirm: () => void;
  onCancel: () => void;
  onSelectAlternative: (roomId: string) => void;
}

export function DelogementPreview({
  visible,
  sourceReservation,
  targetRoom,
  conflicts,
  suggestedRooms,
  onConfirm,
  onCancel,
  onSelectAlternative
}: DelogementPreviewProps) {
  if (!visible || !sourceReservation || !targetRoom) return null;

  const hasConflicts = conflicts.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="preview-panel max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Prévisualisation du délogement
            </h3>
            <p className="text-muted-foreground">
              Vous placez <strong>{sourceReservation.guestName}</strong> en chambre <strong>{targetRoom.number}</strong>
            </p>
          </div>

          {/* Movement Visual */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Période</div>
                <div className="font-medium">
                  {new Date(sourceReservation.start).toLocaleDateString('fr-FR')} → {new Date(sourceReservation.end).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {sourceReservation.nights} nuit{sourceReservation.nights > 1 ? 's' : ''}
                </div>
              </div>
              
              <ArrowRight className="h-8 w-8 text-primary" />
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Nouvelle chambre</div>
                <div className="text-xl font-bold text-primary">
                  {targetRoom.number}
                </div>
                <div className="text-xs text-muted-foreground">
                  {targetRoom.type}
                </div>
              </div>
            </div>
          </div>

          {/* Conflicts Warning */}
          {hasConflicts && (
            <div className="conflict-badge">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Conflit détecté</span>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  {conflicts.length} réservation{conflicts.length > 1 ? 's' : ''} sera{conflicts.length > 1 ? 'nt' : ''} impactée{conflicts.length > 1 ? 's' : ''} :
                </p>
                
                {conflicts.map((conflict, index) => (
                  <div key={conflict.id} className="bg-white/50 rounded-lg p-3 text-sm">
                    <div className="font-medium">{conflict.guestName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conflict.start).toLocaleDateString('fr-FR')} - {new Date(conflict.end).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Rooms */}
          {hasConflicts && suggestedRooms.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">
                Chambres alternatives (même type/étage) :
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {suggestedRooms.slice(0, 4).map((room) => (
                  <TButton
                    key={room.id}
                    variant="default"
                    onClick={() => onSelectAlternative(room.id)}
                    className="flex items-center gap-2 justify-start p-3 h-auto"
                  >
                    <Home className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Ch. {room.number}</div>
                      <div className="text-xs text-muted-foreground">{room.type}</div>
                    </div>
                  </TButton>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <TButton
              variant="default"
              onClick={onCancel}
              className="flex-1 tap-target"
            >
              Annuler
            </TButton>
            
            {hasConflicts ? (
              <TButton
                variant="danger"
                onClick={onConfirm}
                className="flex-1 tap-target"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Appliquer ({conflicts.length + 1} mouvements)
              </TButton>
            ) : (
              <TButton
                onClick={onConfirm}
                className="flex-1 tap-target"
              >
                <Users className="h-4 w-4 mr-2" />
                Confirmer le déplacement
              </TButton>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}