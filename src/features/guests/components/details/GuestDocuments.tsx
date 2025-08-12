import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { Guest } from "@/types/guest";

interface GuestDocumentsProps {
  guest: Guest;
}

export function GuestDocuments({ guest }: GuestDocumentsProps) {
  if (!guest.document_type) return null;

  const typeLabel =
    guest.document_type === "passport"
      ? "Passeport"
      : guest.document_type === "id_card"
      ? "Carte d'identité"
      : "Permis de conduire";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" /> Documents d'identité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <div>{typeLabel}</div>
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
              <div>
                {new Date(guest.document_expiry).toLocaleDateString("fr-FR")}
              </div>
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
  );
}
