import { useState } from "react";
import { User, Mail, Phone, MapPin, Crown, Building2, Calendar, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Guest } from "@/types/guest";
import { EditGuestDialog } from "./EditGuestDialog";
import { GuestDetailsSheet } from "./GuestDetailsSheet";

interface GuestCardProps {
  guest: Guest;
}

export function GuestCard({ guest }: GuestCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

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

  const getGuestTypeVariant = (type: string) => {
    switch (type) {
      case 'corporate': return 'secondary';
      case 'group': return 'outline';
      default: return 'default';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(guest.first_name, guest.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1" onClick={() => setShowDetailsSheet(true)}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {guest.first_name} {guest.last_name}
                  </h3>
                  {guest.vip_status && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  {guest.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{guest.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getGuestTypeVariant(guest.guest_type)}>
                {guest.guest_type === 'corporate' && <Building2 className="h-3 w-3 mr-1" />}
                {getGuestTypeLabel(guest.guest_type)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetailsSheet(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Voir les détails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {guest.company_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span>{guest.company_name}</span>
                </div>
              )}
              
              {guest.city && guest.country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{guest.city}, {guest.country}</span>
                </div>
              )}
              
              {guest.nationality && (
                <div className="flex items-center gap-1">
                  <span>Nationalité: {guest.nationality}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Créé le {new Date(guest.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditGuestDialog
        guest={guest}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      
      <GuestDetailsSheet
        guest={guest}
        open={showDetailsSheet}
        onOpenChange={setShowDetailsSheet}
      />
    </>
  );
}