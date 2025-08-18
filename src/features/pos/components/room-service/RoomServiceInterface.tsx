import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  MapPin, 
  Phone, 
  Plus,
  Minus,
  ShoppingCart,
  Utensils,
  DollarSign
} from "lucide-react";
import { useReservationsForBilling } from "@/features/billing/hooks/useReservations";
const orgId = "demo-org"; // Mock org ID for demo
import { MarketTilesCatalog } from "../MarketTilesCatalog";
import { RoomServiceCart } from "./RoomServiceCart";
import { RoomServiceDeliveryOptions } from "./RoomServiceDeliveryOptions";
import { useRoomServiceLogic } from "./useRoomServiceLogic";
import type { ReservationForBilling } from "@/features/billing/hooks/useReservations";

interface RoomServiceInterfaceProps {
  onBack: () => void;
}

export function RoomServiceInterface({ onBack }: RoomServiceInterfaceProps) {
  const [selectedReservation, setSelectedReservation] = useState<ReservationForBilling | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomSearchQuery, setRoomSearchQuery] = useState("");
  const orgId = "demo-org"; // Mock org ID
  
  const { data: reservations = [], isLoading } = useReservationsForBilling(orgId || "");
  
  const {
    cartItems,
    totals,
    deliveryOptions,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleUpdateDeliveryOptions,
    handleConfirmOrder,
    isProcessing
  } = useRoomServiceLogic({ reservation: selectedReservation });

  // Filter active reservations (present guests)
  const activeReservations = reservations.filter(res => 
    res.status === 'present' && res.room_number
  );

  // Filter reservations based on search
  const filteredReservations = activeReservations.filter(res =>
    res.room_number?.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
    res.guest_name.toLowerCase().includes(roomSearchQuery.toLowerCase())
  );

  // Room selection view
  if (!selectedReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Utensils className="h-6 w-6 text-orange-600" />
                    </div>
                    Room Service
                  </h1>
                  <p className="text-muted-foreground">Commandes en chambre</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-2">
                  <Clock className="h-3 w-3" />
                  {new Date().toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Room Selection */}
        <div className="container mx-auto px-6 py-8">
          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro de chambre ou nom du client..."
                  value={roomSearchQuery}
                  onChange={(e) => setRoomSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredReservations.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune chambre trouvée</h3>
                  <p className="text-muted-foreground">
                    {roomSearchQuery 
                      ? "Aucune chambre ne correspond à votre recherche" 
                      : "Aucun client présent actuellement"
                    }
                  </p>
                </div>
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <Card 
                  key={reservation.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                  onClick={() => setSelectedReservation(reservation)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-3">
                      {/* Room Number */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl">Ch. {reservation.room_number}</h3>
                            <Badge variant="outline" className="text-xs">
                              {reservation.adults + reservation.children} pers.
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Guest Info */}
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{reservation.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Séjour jusqu'au {new Date(reservation.date_departure).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm" 
                        className="w-full group-hover:bg-orange-600 group-hover:text-white transition-colors"
                        variant="outline"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Commander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Room Service Order Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedReservation(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Changer de chambre
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  Room Service - Ch. {selectedReservation.room_number}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {selectedReservation.guest_name} • {selectedReservation.adults + selectedReservation.children} pers.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-2">
                <DollarSign className="h-3 w-3" />
                Total: {totals.total.toLocaleString()} F
              </Badge>
              <Badge variant="outline" className="gap-2">
                <ShoppingCart className="h-3 w-3" />
                {cartItems.length} article{cartItems.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
          
          {/* Left: Product Catalog (50%) */}
          <div className="col-span-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Menu Room Service
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un plat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <MarketTilesCatalog
                  outletId="room-service" // Special outlet for room service
                  searchQuery={searchQuery}
                  onAddToCart={handleAddToCart}
                  onSearchChange={setSearchQuery}
                />
              </CardContent>
            </Card>
          </div>

          {/* Center: Cart (30%) */}
          <div className="col-span-4">
            <RoomServiceCart
              items={cartItems}
              totals={totals}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              reservation={selectedReservation}
            />
          </div>

          {/* Right: Delivery Options & Actions (20%) */}
          <div className="col-span-2 space-y-4">
            <RoomServiceDeliveryOptions
              options={deliveryOptions}
              onUpdateOptions={handleUpdateDeliveryOptions}
              onConfirmOrder={handleConfirmOrder}
              isProcessing={isProcessing}
              canConfirm={cartItems.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}