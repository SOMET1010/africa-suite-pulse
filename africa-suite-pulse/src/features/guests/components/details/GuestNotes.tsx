import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Guest } from "@/types/guest";

interface GuestNotesProps {
  guest: Guest;
}

export function GuestNotes({ guest }: GuestNotesProps) {
  if (!(guest.special_requests || guest.notes)) return null;

  return (
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
  );
}
