import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Guest } from "@/types/guest";

interface GuestAddressProps {
  guest: Guest;
}

export function GuestAddress({ guest }: GuestAddressProps) {
  if (!(guest.address_line1 || guest.city || guest.country)) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Adresse
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
  );
}
