import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useStartNightAudit } from "../hooks/useNightAudit";

interface StartAuditDialogProps {
  trigger: React.ReactNode;
  hasActiveSession: boolean;
}

export function StartAuditDialog({ trigger, hasActiveSession }: StartAuditDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const startAudit = useStartNightAudit();

  const handleStartAudit = async () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    await startAudit.mutateAsync(dateStr);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Démarrer un audit de nuit</DialogTitle>
          <DialogDescription>
            Sélectionnez la date pour laquelle vous souhaitez effectuer l'audit de nuit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date d'audit</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveSession && (
            <div className="bg-soft-warning p-4 rounded-md">
              <p className="text-sm text-warning">
                ⚠️ Une session d'audit est déjà en cours. Démarrer une nouvelle session fermera automatiquement la précédente.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleStartAudit}
            disabled={startAudit.isPending}
          >
            {startAudit.isPending ? "Démarrage..." : "Démarrer l'audit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}