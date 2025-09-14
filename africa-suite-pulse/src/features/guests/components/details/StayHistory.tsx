import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuestStayHistory } from "@/types/guest";

function getReservationStatusLabel(status?: string) {
  switch (status) {
    case "confirmed":
      return "Confirmée";
    case "checked_in":
      return "Arrivé";
    case "checked_out":
      return "Parti";
    case "cancelled":
      return "Annulée";
    default:
      return status || "";
  }
}

function getReservationStatusVariant(status?: string) {
  switch (status) {
    case "confirmed":
      return "default" as const;
    case "checked_in":
      return "default" as const;
    case "checked_out":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

interface StayHistoryProps {
  stayHistory: GuestStayHistory[];
}

export function StayHistory({ stayHistory }: StayHistoryProps) {
  return (
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
                      {stay.date_arrival &&
                        new Date(stay.date_arrival).toLocaleDateString("fr-FR")} -
                      {stay.date_departure &&
                        new Date(stay.date_departure).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div>
                    <span>Chambre:</span>
                    <div>
                      {stay.room_number} ({stay.room_type})
                    </div>
                  </div>
                  <div>
                    <span>Occupants:</span>
                    <div>
                      {stay.adults} adultes
                      {stay.children ? `, ${stay.children} enfants` : ""}
                    </div>
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
            <span role="img" aria-label="hotel" className="text-2xl">🏨</span>
            <p>Aucun séjour enregistré pour ce client</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
