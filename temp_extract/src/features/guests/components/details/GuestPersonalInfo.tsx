import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar } from "lucide-react";
import type { Guest } from "@/types/guest";

interface GuestPersonalInfoProps {
  guest: Guest;
}

export function GuestPersonalInfo({ guest }: GuestPersonalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Informations personnelles</CardTitle>
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
            <span>
              Né(e) le {new Date(guest.date_of_birth).toLocaleDateString("fr-FR")}
            </span>
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
  );
}
