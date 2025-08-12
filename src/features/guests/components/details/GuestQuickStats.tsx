import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Receipt } from "lucide-react";
import type { GuestStayHistory } from "@/types/guest";

interface GuestQuickStatsProps {
  stayHistory: GuestStayHistory[];
}

export function GuestQuickStats({ stayHistory }: GuestQuickStatsProps) {
  const totalStays = stayHistory.length;
  const totalRevenue = stayHistory.reduce(
    (sum, stay) => sum + (stay.invoice_total || 0),
    0
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Hotel className="h-4 w-4" /> Séjours totaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStays}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Revenus totaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalRevenue.toLocaleString()} XOF
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
