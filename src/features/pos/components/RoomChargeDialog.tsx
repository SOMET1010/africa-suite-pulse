import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, User, CreditCard, FileSignature } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface RoomChargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  orderItems: OrderItem[];
  onSuccess: () => void;
}

export function RoomChargeDialog({ 
  open, 
  onOpenChange, 
  amount, 
  orderItems,
  onSuccess 
}: RoomChargeDialogProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  

  const searchReservation = async () => {
    if (!roomNumber) return;
    
    setIsLoading(true);
    try {
      // Simuler la recherche d'une réservation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock reservation data for demonstration
      const mockReservation = {
        id: `res-${roomNumber}`,
        status: 'present',
        guest_id: `guest-${roomNumber}`,
        room_id: `room-${roomNumber}`,
        guests: {
          first_name: 'Client',
          last_name: `Chambre ${roomNumber}`,
          email: `client${roomNumber}@hotel.com`
        },
        rooms: {
          number: roomNumber
        }
      };
      
      setReservation(mockReservation);
      setGuestName(`${mockReservation.guests.first_name} ${mockReservation.guests.last_name}`);
      
      toast.success(`Réservation trouvée - Chambre ${roomNumber} - Client présent`);
    } catch (error) {
      console.error('Search reservation error:', error);
      toast.error("Erreur lors de la recherche de la réservation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessRoomCharge = async () => {
    if (!reservation || !guestName || !signature) {
      toast.error("Veuillez remplir tous les champs et signer");
      return;
    }

    setIsLoading(true);
    try {
      // Créer la description détaillée
      const description = `Consommation Restaurant/Bar - Chambre ${roomNumber}\n` +
        orderItems.map(item => 
          `${item.product_name} x${item.quantity} = ${item.total_price.toLocaleString()} XOF`
        ).join('\n');

      // Simuler la création de la room charge
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const roomChargeData = {
        id: `charge-${Date.now()}`,
        room_id: reservation.room_id,
        guest_id: reservation.guest_id,
        amount: amount,
        description: description,
        charge_date: new Date().toISOString(),
        status: 'pending',
        guest_signature: signature,
        order_data: { items: orderItems }
      };

      console.log('Room Charge Created:', roomChargeData);

      toast.success(`Room Charge créé - ${amount.toLocaleString()} XOF facturée à la chambre ${roomNumber}`);

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Process room charge error:', error);
      toast.error("Erreur lors du traitement du Room Charge");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRoomNumber("");
    setGuestName("");
    setReservation(null);
    setSignature("");
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      ctx?.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setSignature("signed"); // Simple flag pour indiquer qu'il y a une signature
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      const ctx = signatureRef.current.getContext('2d');
      ctx?.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height);
      setSignature("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Room Charge - Facturation Chambre
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de la commande */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Détail de la consommation</h3>
            <div className="space-y-1 text-sm">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span className="font-mono">{item.total_price.toLocaleString()} XOF</span>
                </div>
              ))}
              <div className="border-t pt-1 font-semibold flex justify-between">
                <span>Total:</span>
                <span className="font-mono">{amount.toLocaleString()} XOF</span>
              </div>
            </div>
          </div>

          {/* Recherche de chambre */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="roomNumber">Numéro de chambre</Label>
                <Input
                  id="roomNumber"
                  placeholder="Ex: 101"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  onBlur={searchReservation}
                />
              </div>
              <Button 
                onClick={searchReservation} 
                disabled={!roomNumber || isLoading}
                className="mt-6"
              >
                <User className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            {reservation && (
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <div className="flex items-center gap-2 text-green-800">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Réservation active trouvée</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Client: {guestName} | Chambre: {roomNumber}
                </p>
              </div>
            )}
          </div>

          {/* Nom du client */}
          {reservation && (
            <div>
              <Label htmlFor="guestName">Nom du client</Label>
              <Input
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nom du client"
              />
            </div>
          )}

          {/* Signature */}
          {reservation && (
            <div className="space-y-2">
              <Label>Signature du client</Label>
              <div className="border border-border rounded-lg p-2">
                <canvas
                  ref={signatureRef}
                  width={400}
                  height={150}
                  className="border border-dashed border-gray-300 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">
                    <FileSignature className="h-4 w-4 inline mr-1" />
                    Demandez au client de signer dans la zone ci-dessus
                  </p>
                  <Button variant="outline" size="sm" onClick={clearSignature}>
                    Effacer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleProcessRoomCharge}
              disabled={!reservation || !guestName || !signature || isLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? "Traitement..." : "Facturer à la chambre"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}