import { Guest } from "@/types/guest";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Building2, Crown, Edit } from "lucide-react";

interface GuestHeaderProps {
  guest: Guest;
  onEdit: () => void;
}

function getInitials(firstName?: string, lastName?: string) {
  const f = (firstName || "").charAt(0);
  const l = (lastName || "").charAt(0);
  return `${f}${l}`.toUpperCase() || "G";
}

function getGuestTypeLabel(type?: string) {
  switch (type) {
    case "individual":
      return "Particulier";
    case "corporate":
      return "Entreprise";
    case "group":
      return "Groupe";
    default:
      return type || "Inconnu";
  }
}

export function GuestHeader({ guest, onEdit }: GuestHeaderProps) {
  return (
    <>
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
              {guest.vip_status && <Crown className="h-5 w-5 text-yellow-500" />}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline">
                {guest.guest_type === "corporate" && (
                  <Building2 className="h-3 w-3 mr-1" />
                )}
                {getGuestTypeLabel(guest.guest_type)}
              </Badge>

              <span className="text-sm text-muted-foreground">
                Client depuis {new Date(guest.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" /> Modifier
          </Button>
        </div>

        <SheetDescription>
          Informations détaillées et historique des séjours
        </SheetDescription>
      </SheetHeader>
    </>
  );
}
