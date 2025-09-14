import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { guestsApi } from "@/services/guests.api";
import type { Guest, GuestStayHistory } from "@/types/guest";
import { EditGuestDialog } from "./EditGuestDialog";
import { LoyaltyStatusCard } from "./LoyaltyStatusCard";
import { GuestHeader } from "./details/GuestHeader";
import { GuestQuickStats } from "./details/GuestQuickStats";
import { GuestPersonalInfo } from "./details/GuestPersonalInfo";
import { GuestAddress } from "./details/GuestAddress";
import { GuestDocuments } from "./details/GuestDocuments";
import { GuestCompany } from "./details/GuestCompany";
import { GuestNotes } from "./details/GuestNotes";
import { StayHistory } from "./details/StayHistory";

interface GuestDetailsSheetProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestDetailsSheet({ guest, open, onOpenChange }: GuestDetailsSheetProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: stayHistory = [] } = useQuery({
    queryKey: ["guest-stay-history", guest.id],
    queryFn: () => guestsApi.getStayHistory(guest.id),
    enabled: open,
    select: (result): GuestStayHistory[] => result.data || [],
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
          <GuestHeader guest={guest} onEdit={() => setShowEditDialog(true)} />

          <div className="space-y-6 mt-6">
            <GuestQuickStats stayHistory={stayHistory} />
            <GuestPersonalInfo guest={guest} />
            <GuestAddress guest={guest} />
            <GuestDocuments guest={guest} />
            <GuestCompany guest={guest} />
            <GuestNotes guest={guest} />
            <LoyaltyStatusCard guestId={guest.id} />
            <StayHistory stayHistory={stayHistory} />
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
