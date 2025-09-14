import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, CreditCard, Clock, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionModalProps {
  action: 'checkin' | 'reservation' | 'payment' | 'search';
  trigger: React.ReactNode;
  onComplete?: () => void;
}

export function QuickActionModal({ action, trigger, onComplete }: QuickActionModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Actions différentes selon le type
    switch (action) {
      case 'checkin':
        navigate('/arrivals', { state: { quickCheckin: formData } });
        break;
      case 'reservation':
        navigate('/reservations/new', { state: { quickData: formData } });
        break;
      case 'payment':
        navigate('/pos', { state: { quickPayment: formData } });
        break;
      case 'search':
        navigate('/search', { state: { query: formData.query } });
        break;
    }
    
    setOpen(false);
    onComplete?.();
  };

  const renderContent = () => {
    switch (action) {
      case 'checkin':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room">Numéro de chambre</Label>
                <Input
                  id="room"
                  placeholder="ex: 205"
                  value={formData.room || ''}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="guest">Nom du client</Label>
                <Input
                  id="guest"
                  placeholder="Nom complet"
                  value={formData.guest || ''}
                  onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmation">Code de confirmation</Label>
              <Input
                id="confirmation"
                placeholder="Numéro de réservation"
                value={formData.confirmation || ''}
                onChange={(e) => setFormData({ ...formData, confirmation: e.target.value })}
              />
            </div>
          </div>
        );

      case 'reservation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="arrival">Date d'arrivée</Label>
                <Input
                  id="arrival"
                  type="date"
                  value={formData.arrival || ''}
                  onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="departure">Date de départ</Label>
                <Input
                  id="departure"
                  type="date"
                  value={formData.departure || ''}
                  onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults">Adultes</Label>
                <Select value={formData.adults || ''} onValueChange={(value) => setFormData({ ...formData, adults: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="children">Enfants</Label>
                <Select value={formData.children || ''} onValueChange={(value) => setFormData({ ...formData, children: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nombre" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0,1,2,3].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Montant à encaisser</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0 XOF"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="method">Mode de paiement</Label>
              <Select value={formData.method || ''} onValueChange={(value) => setFormData({ ...formData, method: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                  <SelectItem value="mobile">Mobile Money</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input
                id="reference"
                placeholder="Numéro de chambre ou facture"
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="query">Recherche globale</Label>
              <Input
                id="query"
                placeholder="Nom, chambre, réservation..."
                value={formData.query || ''}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">Clients</Badge>
              <Badge variant="outline">Réservations</Badge>
              <Badge variant="outline">Chambres</Badge>
              <Badge variant="outline">Factures</Badge>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (action) {
      case 'checkin': return 'Check-in Express';
      case 'reservation': return 'Nouvelle Réservation';
      case 'payment': return 'Encaisser Paiement';
      case 'search': return 'Recherche Rapide';
      default: return 'Action Rapide';
    }
  };

  const getIcon = () => {
    switch (action) {
      case 'checkin': return <Users className="h-4 w-4" />;
      case 'reservation': return <Calendar className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderContent()}
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Continuer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}