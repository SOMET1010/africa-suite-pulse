import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TButton } from "@/core/ui/TButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateInvoice } from "../hooks/useCreateInvoice";
import { Loader2 } from "lucide-react";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [description, setDescription] = useState('');
  const createInvoice = useCreateInvoice();

  const handleCreate = async () => {
    if (!guestName.trim()) {
      return;
    }

    try {
      await createInvoice.mutateAsync({
        guest_name: guestName,
        guest_email: guestEmail || undefined,
        description: description || undefined,
        items: [] // Empty items for now, can be added later
      });
      
      // Reset form and close dialog
      setGuestName('');
      setGuestEmail('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      // Error handled by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle facture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="guestName">Nom du client</Label>
            <Input 
              id="guestName"
              value={guestName} 
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nom complet du client"
              required
            />
          </div>
          <div>
            <Label htmlFor="guestEmail">Email (optionnel)</Label>
            <Input 
              id="guestEmail"
              type="email"
              value={guestEmail} 
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la facture"
            />
          </div>
          <div className="flex gap-2">
            <TButton 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={createInvoice.isPending}
            >
              Annuler
            </TButton>
            <TButton 
              variant="primary" 
              onClick={handleCreate}
              disabled={createInvoice.isPending || !guestName.trim()}
            >
              {createInvoice.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer
            </TButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}