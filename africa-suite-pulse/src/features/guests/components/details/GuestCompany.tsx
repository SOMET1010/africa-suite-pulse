import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import type { Guest } from "@/types/guest";

interface GuestCompanyProps {
  guest: Guest;
}

export function GuestCompany({ guest }: GuestCompanyProps) {
  if (!guest.company_name) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Informations entreprise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-medium">{guest.company_name}</span>
        </div>
        {guest.company_address && (
          <div className="text-sm text-muted-foreground">{guest.company_address}</div>
        )}
        {guest.tax_id && (
          <div className="text-sm">
            <span className="text-muted-foreground">N° fiscal:</span> {guest.tax_id}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
