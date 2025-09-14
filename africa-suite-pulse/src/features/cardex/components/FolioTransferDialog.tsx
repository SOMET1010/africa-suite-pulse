import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cardexApi } from "@/services/cardex.api";
import { toast } from "@/hooks/use-toast";
import type { FolioSummary, CardexLine } from "@/types/cardex";

const transferSchema = z.object({
  fromFolio: z.number().min(1).max(6),
  toFolio: z.number().min(1).max(6),
  amount: z.number().positive("Le montant doit être positif"),
  reason: z.string().optional(),
  selectedLines: z.array(z.string()).min(1, "Sélectionnez au moins une ligne"),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface FolioTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  folios: FolioSummary[];
  lines: CardexLine[];
  onTransferComplete?: () => void;
}

export function FolioTransferDialog({
  open,
  onOpenChange,
  reservationId,
  folios,
  lines,
  onTransferComplete,
}: FolioTransferDialogProps) {
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      selectedLines: [],
      amount: 0,
    },
  });

  const fromFolio = form.watch("fromFolio");
  const toFolio = form.watch("toFolio");

  // Filtrer les lignes selon le folio source sélectionné
  const availableLines = lines.filter(line => 
    fromFolio ? line.folio_number === fromFolio : true
  );

  // Calculer le montant total des lignes sélectionnées
  const selectedAmount = availableLines
    .filter(line => selectedLines.includes(line.id))
    .reduce((sum, line) => sum + line.debit, 0);

  // Mettre à jour le montant quand les lignes sélectionnées changent
  React.useEffect(() => {
    form.setValue("amount", selectedAmount);
    form.setValue("selectedLines", selectedLines);
  }, [selectedAmount, selectedLines, form]);

  const handleLineSelection = (lineId: string, checked: boolean) => {
    setSelectedLines(prev => 
      checked 
        ? [...prev, lineId]
        : prev.filter(id => id !== lineId)
    );
  };

  const handleTransfer = async (data: TransferFormData) => {
    if (data.fromFolio === data.toFolio) {
      toast({
        title: "Erreur",
        description: "Le folio source et destination doivent être différents",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      await cardexApi.transferBetweenFolios(reservationId, {
        from_folio: data.fromFolio,
        to_folio: data.toFolio,
        amount: data.amount,
        line_ids: data.selectedLines,
        reason: data.reason,
      });

      toast({
        title: "Transfert effectué",
        description: `${data.amount.toLocaleString()} FCFA transférés du folio ${data.fromFolio} vers le folio ${data.toFolio}`,
      });

      onTransferComplete?.();
      onOpenChange(false);
      form.reset();
      setSelectedLines([]);
    } catch (error) {
      toast({
        title: "Erreur de transfert",
        description: "Impossible d'effectuer le transfert",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Transfert entre folios
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-6">
          {/* Sélection des folios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromFolio">Folio source</Label>
              <Select 
                value={fromFolio?.toString()} 
                onValueChange={(value) => {
                  form.setValue("fromFolio", parseInt(value));
                  setSelectedLines([]); // Reset selection
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le folio source" />
                </SelectTrigger>
                <SelectContent>
                  {folios.filter(f => f.balance > 0).map((folio) => (
                    <SelectItem key={folio.folio_number} value={folio.folio_number.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>Folio {folio.folio_number} - {folio.label}</span>
                        <Badge variant="outline">
                          {folio.balance.toLocaleString()} FCFA
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toFolio">Folio destination</Label>
              <Select 
                value={toFolio?.toString()} 
                onValueChange={(value) => form.setValue("toFolio", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le folio destination" />
                </SelectTrigger>
                <SelectContent>
                  {folios.map((folio) => (
                    <SelectItem 
                      key={folio.folio_number} 
                      value={folio.folio_number.toString()}
                      disabled={folio.folio_number === fromFolio}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Folio {folio.folio_number} - {folio.label}</span>
                        <Badge variant="outline">
                          {folio.balance.toLocaleString()} FCFA
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lignes disponibles pour transfert */}
          {fromFolio && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Lignes à transférer du Folio {fromFolio}
                  </Label>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Total: {selectedAmount.toLocaleString()} FCFA
                  </Badge>
                </div>

                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {availableLines.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Aucune ligne disponible pour ce folio
                    </div>
                  ) : (
                    <div className="divide-y">
                      {availableLines.map((line) => (
                        <div
                          key={line.id}
                          className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedLines.includes(line.id)}
                            onCheckedChange={(checked) => 
                              handleLineSelection(line.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{line.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {line.service_code} • {new Date(line.date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {line.debit.toLocaleString()} FCFA
                                </p>
                                <Badge variant="outline">
                                  {line.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Montant et raison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant total</Label>
              <Input
                {...form.register("amount", { valueAsNumber: true })}
                type="number"
                disabled
                className="bg-muted"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                {...form.register("reason")}
                placeholder="Motif du transfert..."
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isTransferring}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!fromFolio || !toFolio || selectedLines.length === 0 || isTransferring}
            >
              {isTransferring ? "Transfert en cours..." : "Effectuer le transfert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}