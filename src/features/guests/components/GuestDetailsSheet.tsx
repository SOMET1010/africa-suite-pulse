import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Building2,
  Crown,
  Edit,
  Hotel,
  Receipt,
} from "lucide-react";
import { guestsApi } from "@/services/guests.api";
import type { Guest } from "@/types/guest";
import { EditGuestDialog } from "./EditGuestDialog";

interface GuestDetailsSheetProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestDetailsSheet({ guest, open, onOpenChange }: GuestDetailsSheetProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Charger l'historique des séjours
  const { data: stayHistory } = useQuery({
    queryKey: ["guest-stay-history", guest.id],
    queryFn: () => guestsApi.getStayHistory(guest.id),
    enabled: open,
    select: (result) => result.data || [],
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getGuestTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Particulier';
      case 'corporate': return 'Entreprise';
      case 'group': return 'Groupe';
      default: return type;
    }
  };

  const getReservationStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'checked_in': return 'Arrivé';
      case 'checked_out': return 'Parti';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getReservationStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'checked_in': return 'default';
      case 'checked_out': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const totalStays = stayHistory?.length || 0;
  const totalRevenue = stayHistory?.reduce((sum, stay) => sum + (stay.invoice_total || 0), 0) || 0;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                  {getInitials(guest.first_name, guest.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-xl">
                    {guest.first_name} {guest.last_name}
                  </SheetTitle>
                  {guest.vip_status && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline">
                    {guest.guest_type === 'corporate' && <Building2 className="h-3 w-3 mr-1" />}
                    {getGuestTypeLabel(guest.guest_type)}
                  </Badge>
                  
                  <span className="text-sm text-muted-foreground">
                    Client depuis {new Date(guest.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            </div>
            
            <SheetDescription>
              Informations détaillées et historique des séjours
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Séjours totaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStays}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Revenus totaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} XOF</div>
                </CardContent>
              </Card>
            </div>

            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guest.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{guest.email}</span>
                  </div>
                )}
                
                {guest.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{guest.phone}</span>
                  </div>
                )}
                
                {guest.date_of_birth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Né(e) le {new Date(guest.date_of_birth).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                
                {guest.nationality && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Nationalité:</span>
                    <span>{guest.nationality}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adresse */}
            {(guest.address_line1 || guest.city || guest.country) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {guest.address_line1 && <div>{guest.address_line1}</div>}
                    {guest.address_line2 && <div>{guest.address_line2}</div>}
                    <div>
                      {[guest.city, guest.state_province, guest.postal_code]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {guest.country && <div>{guest.country}</div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents d'identité */}
            {guest.document_type && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents d'identité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <div>{guest.document_type === 'passport' ? 'Passeport' : 
                            guest.document_type === 'id_card' ? 'Carte d\'identité' : 
                            'Permis de conduire'}</div>
                    </div>
                    {guest.document_number && (
                      <div>
                        <span className="text-muted-foreground">Numéro:</span>
                        <div>{guest.document_number}</div>
                      </div>
                    )}
                    {guest.document_expiry && (
                      <div>
                        <span className="text-muted-foreground">Expiration:</span>
                        <div>{new Date(guest.document_expiry).toLocaleDateString('fr-FR')}</div>
                      </div>
                    )}
                    {guest.document_issuing_country && (
                      <div>
                        <span className="text-muted-foreground">Pays d'émission:</span>
                        <div>{guest.document_issuing_country}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entreprise */}
            {guest.company_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Informations entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">{guest.company_name}</span>
                  </div>
                  {guest.company_address && (
                    <div className="text-sm text-muted-foreground">
                      {guest.company_address}
                    </div>
                  )}
                  {guest.tax_id && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">N° fiscal:</span> {guest.tax_id}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes et demandes spéciales */}
            {(guest.special_requests || guest.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes et demandes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guest.special_requests && (
                    <div>
                      <h4 className="font-medium mb-1">Demandes spéciales</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {guest.special_requests}
                      </p>
                    </div>
                  )}
                  
                  {guest.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Notes internes</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {guest.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Historique des séjours */}
            <Card>
              <CardHeader>
                <CardTitle>Historique des séjours</CardTitle>
              </CardHeader>
              <CardContent>
                {stayHistory && stayHistory.length > 0 ? (
                  <div className="space-y-3">
                    {stayHistory.map((stay, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {stay.reservation_reference || `Séjour #${index + 1}`}
                            </span>
                            {stay.reservation_status && (
                              <Badge variant={getReservationStatusVariant(stay.reservation_status)}>
                                {getReservationStatusLabel(stay.reservation_status)}
                              </Badge>
                            )}
                          </div>
                          {stay.invoice_total && (
                            <span className="font-medium">
                              {stay.invoice_total.toLocaleString()} XOF
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span>Dates:</span>
                            <div>
                              {stay.date_arrival && new Date(stay.date_arrival).toLocaleDateString('fr-FR')} - 
                              {stay.date_departure && new Date(stay.date_departure).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div>
                            <span>Chambre:</span>
                            <div>{stay.room_number} ({stay.room_type})</div>
                          </div>
                          <div>
                            <span>Occupants:</span>
                            <div>{stay.adults} adultes{stay.children ? `, ${stay.children} enfants` : ''}</div>
                          </div>
                          <div>
                            <span>Nuits:</span>
                            <div>{stay.nights_count}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Hotel className="h-8 w-8 mx-auto mb-2" />
                    <p>Aucun séjour enregistré pour ce client</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      <EditGuestDialog
        guest={guest}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}