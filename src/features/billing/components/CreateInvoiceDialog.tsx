import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TButton } from "@/core/ui/TButton";
import { Plus, Trash2, Save } from "lucide-react";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const { orgId } = useOrgId();
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [stayInfo, setStayInfo] = useState({
    reservationId: "",
    roomNumber: "",
    roomType: "",
    checkInDate: "",
    checkOutDate: "",
    adultsCount: 1,
    childrenCount: 0
  });
  const [reference, setReference] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0, tax_rate: 18 }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      return sum + (itemTotal * item.tax_rate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const calculateNights = () => {
    if (stayInfo.checkInDate && stayInfo.checkOutDate) {
      const checkIn = new Date(stayInfo.checkInDate);
      const checkOut = new Date(stayInfo.checkOutDate);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleCreate = async () => {
    if (!guestInfo.name.trim() || items.some(item => !item.description.trim())) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate invoice number (simplified)
      const invoiceNumber = `INV-${Date.now()}`;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await (supabase as any)
        .from('invoices')
        .insert({
          org_id: orgId,
          number: invoiceNumber,
          guest_name: guestInfo.name,
          guest_email: guestInfo.email || null,
          guest_phone: guestInfo.phone || null,
          guest_address: guestInfo.address || null,
          reservation_id: stayInfo.reservationId || null,
          room_number: stayInfo.roomNumber || null,
          room_type: stayInfo.roomType || null,
          check_in_date: stayInfo.checkInDate || null,
          check_out_date: stayInfo.checkOutDate || null,
          nights_count: calculateNights(),
          adults_count: stayInfo.adultsCount,
          children_count: stayInfo.childrenCount,
          reference: reference || null,
          due_date: dueDate || null,
          notes: notes || null,
          subtotal: calculateSubtotal(),
          tax_amount: calculateTax(),
          total_amount: calculateTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const { error: itemsError } = await (supabase as any)
        .from('invoice_items')
        .insert(
          items.map((item: any) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            total: item.quantity * item.unit_price * (1 + item.tax_rate / 100)
          }))
        );

      if (itemsError) throw itemsError;

      toast({
        title: "Facture créée",
        description: `Facture ${invoiceNumber} créée avec succès`
      });

      // Reset form
      setGuestInfo({ name: "", email: "", phone: "", address: "" });
      setStayInfo({
        reservationId: "",
        roomNumber: "",
        roomType: "",
        checkInDate: "",
        checkOutDate: "",
        adultsCount: 1,
        childrenCount: 0
      });
      setReference("");
      setDueDate("");
      setNotes("");
      setItems([{ id: "1", description: "", quantity: 1, unit_price: 0, tax_rate: 18 }]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-luxury text-charcoal">Nouvelle facture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-luxury">Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guestName">Nom du client *</Label>
                  <Input
                    id="guestName"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom complet du client"
                  />
                </div>
                <div>
                  <Label htmlFor="guestEmail">Email</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <Label htmlFor="guestPhone">Téléphone</Label>
                  <Input
                    id="guestPhone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="guestAddress">Adresse</Label>
                  <Input
                    id="guestAddress"
                    value={guestInfo.address}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-luxury">Informations du séjour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber">Numéro de chambre</Label>
                  <Input
                    id="roomNumber"
                    value={stayInfo.roomNumber}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, roomNumber: e.target.value }))}
                    placeholder="101"
                  />
                </div>
                <div>
                  <Label htmlFor="roomType">Type de chambre</Label>
                  <Input
                    id="roomType"
                    value={stayInfo.roomType}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, roomType: e.target.value }))}
                    placeholder="Standard"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInDate">Date d'arrivée</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={stayInfo.checkInDate}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, checkInDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutDate">Date de départ</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={stayInfo.checkOutDate}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, checkOutDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adultsCount">Adultes</Label>
                  <Input
                    id="adultsCount"
                    type="number"
                    min="1"
                    value={stayInfo.adultsCount}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, adultsCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="childrenCount">Enfants</Label>
                  <Input
                    id="childrenCount"
                    type="number"
                    min="0"
                    value={stayInfo.childrenCount}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, childrenCount: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nights">Nuits calculées</Label>
                  <Input
                    id="nights"
                    value={calculateNights()}
                    disabled
                    className="bg-charcoal/5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reservationId">Référence réservation</Label>
                  <Input
                    id="reservationId"
                    value={stayInfo.reservationId}
                    onChange={(e) => setStayInfo(prev => ({ ...prev, reservationId: e.target.value }))}
                    placeholder="RES-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Référence facture</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="REF-001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-luxury">Articles</CardTitle>
                <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {index === 0 && <Label className="text-xs">Description</Label>}
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Description de l'article"
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">Quantité</Label>}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">Prix unitaire</Label>}
                      <Input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', Number(e.target.value))}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <Label className="text-xs">TVA (%)</Label>}
                      <Select 
                        value={item.tax_rate.toString()} 
                        onValueChange={(value) => updateItem(item.id, 'tax_rate', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1">
                      {index === 0 && <div className="h-5"></div>}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between font-premium">
                    <span>Sous-total:</span>
                    <span>{calculateSubtotal().toLocaleString()} XOF</span>
                  </div>
                  <div className="flex justify-between font-premium">
                    <span>TVA:</span>
                    <span>{calculateTax().toLocaleString()} XOF</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-luxury font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-brand-accent">{calculateTotal().toLocaleString()} XOF</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-luxury">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes additionnelles pour la facture..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <TButton 
              variant="primary" 
              onClick={handleCreate}
              disabled={isCreating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isCreating ? "Création..." : "Créer la facture"}
            </TButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}