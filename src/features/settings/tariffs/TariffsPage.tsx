import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, Users, Percent, Trash2, Edit3, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTariffs } from './hooks/useTariffs';
import { useRoomTypes } from '../rooms/useRoomTypes';
import { useOrgId } from '@/core/auth/useOrg';
import { toast } from '@/hooks/use-toast';
import { RateWindowsTab } from './components/RateWindowsTab';
import { RateCalculatorPreview } from './components/RateCalculatorPreview';

interface TariffFormData {
  code: string;
  label: string;
  description?: string;
  base_rate: number;
  client_type: 'individual' | 'corporate' | 'group';
  room_types: string[];
  min_nights?: number;
  max_nights?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const initialFormData: TariffFormData = {
  code: '',
  label: '',
  description: '',
  base_rate: 50000,
  client_type: 'individual',
  room_types: [],
  min_nights: 1,
  max_nights: undefined,
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  is_active: true
};

export default function TariffsPage() {
  const { orgId } = useOrgId();
  const { tariffs, loading, createTariff, updateTariff, deleteTariff } = useTariffs(orgId || '');
  const { roomTypes } = useRoomTypes(orgId || '');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTariff, setEditingTariff] = useState<any>(null);
  const [formData, setFormData] = useState<TariffFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTariff) {
        await updateTariff.mutateAsync({ id: editingTariff.id, data: formData });
        toast({ title: "Tarif modifié avec succès" });
      } else {
        await createTariff.mutateAsync(formData);
        toast({ title: "Tarif créé avec succès" });
      }
      
      setShowCreateDialog(false);
      setEditingTariff(null);
      setFormData(initialFormData);
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder le tarif",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tariff: any) => {
    setEditingTariff(tariff);
    setFormData({
      code: tariff.code,
      label: tariff.label,
      description: tariff.description || '',
      base_rate: tariff.base_rate,
      client_type: tariff.client_type || 'individual',
      room_types: tariff.room_types || [],
      min_nights: tariff.min_nights,
      max_nights: tariff.max_nights,
      valid_from: tariff.valid_from,
      valid_until: tariff.valid_until,
      is_active: tariff.is_active
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      try {
        await deleteTariff.mutateAsync(id);
        toast({ title: "Tarif supprimé avec succès" });
      } catch (error) {
        toast({ 
          title: "Erreur", 
          description: "Impossible de supprimer le tarif",
          variant: "destructive"
        });
      }
    }
  };

  const filteredTariffs = tariffs?.filter(tariff =>
    tariff.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tariff.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomTypeNames = (codes: string[]) => {
    return codes.map(code => {
      const roomType = roomTypes?.find(rt => rt.code === code);
      return roomType?.label || code;
    }).join(', ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  return (
    <div className="min-h-screen bg-pearl">
      <div className="absolute inset-0 bg-gradient-to-br from-pearl via-background to-platinum/50" />
      
      <div className="relative container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <nav className="text-sm text-muted-foreground mb-6 font-premium">
            <span>Paramètres</span> 
            <Crown className="inline mx-2 h-3 w-3 accent-gold" />
            <span className="accent-gold font-medium">Grille Tarifaire</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 glass-card border-accent-gold shadow-luxury rounded-xl">
                  <DollarSign className="h-8 w-8 accent-gold" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-luxury font-bold text-charcoal leading-tight">
                    Grille Tarifaire
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 accent-gold" />
                    <span className="text-lg text-muted-foreground font-premium">
                      Gestion avancée des tarifs et fenêtres saisonnières
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="tariffs" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="tariffs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tarifs de Base
            </TabsTrigger>
            <TabsTrigger value="windows" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fenêtres Tarifaires
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Simulateur
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Rechercher un tarif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau Tarif
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTariff ? 'Modifier le tarif' : 'Créer un nouveau tarif'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="code">Code tarif</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          placeholder="STD2024"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="label">Libellé</Label>
                        <Input
                          id="label"
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          placeholder="Tarif Standard 2024"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description du tarif..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="base_rate">Tarif de base (F CFA)</Label>
                        <Input
                          id="base_rate"
                          type="number"
                          value={formData.base_rate}
                          onChange={(e) => setFormData({ ...formData, base_rate: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="client_type">Type de clientèle</Label>
                        <Select 
                          value={formData.client_type} 
                          onValueChange={(value: any) => setFormData({ ...formData, client_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individuel</SelectItem>
                            <SelectItem value="corporate">Entreprise</SelectItem>
                            <SelectItem value="group">Groupe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Types de chambres applicables</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {roomTypes?.map((roomType) => (
                          <label key={roomType.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.room_types.includes(roomType.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    room_types: [...formData.room_types, roomType.code]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    room_types: formData.room_types.filter(code => code !== roomType.code)
                                  });
                                }
                              }}
                            />
                            <span className="text-sm">{roomType.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_nights">Nuits minimum</Label>
                        <Input
                          id="min_nights"
                          type="number"
                          value={formData.min_nights || ''}
                          onChange={(e) => setFormData({ ...formData, min_nights: parseInt(e.target.value) || undefined })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_nights">Nuits maximum</Label>
                        <Input
                          id="max_nights"
                          type="number"
                          value={formData.max_nights || ''}
                          onChange={(e) => setFormData({ ...formData, max_nights: parseInt(e.target.value) || undefined })}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valid_from">Valide du</Label>
                        <Input
                          id="valid_from"
                          type="date"
                          value={formData.valid_from}
                          onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="valid_until">Valide jusqu'au</Label>
                        <Input
                          id="valid_until"
                          type="date"
                          value={formData.valid_until}
                          onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Tarif actif</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingTariff ? 'Modifier' : 'Créer'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tarifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tariffs?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-success/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarifs Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {tariffs?.filter(t => t.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-accent-gold/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tarif Moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold accent-gold">
                {tariffs?.length ? formatCurrency(
                  tariffs.reduce((sum, t) => sum + t.base_rate, 0) / tariffs.length
                ) : 'N/A'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-info/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Types Couverts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {new Set(tariffs?.flatMap(t => t.room_types || [])).size || 0}
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Tariffs List */}
            <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Liste des Tarifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : filteredTariffs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun tarif trouvé
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTariffs?.map((tariff) => (
                  <div key={tariff.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{tariff.label}</h3>
                        <Badge variant={tariff.is_active ? "default" : "secondary"}>
                          {tariff.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">
                          {tariff.client_type === 'individual' ? 'Individuel' : 
                           tariff.client_type === 'corporate' ? 'Entreprise' : 'Groupe'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Code: {tariff.code}</div>
                        <div>Tarif: {formatCurrency(tariff.base_rate)}</div>
                        <div>Types: {getRoomTypeNames(tariff.room_types || [])}</div>
                        <div>Période: {tariff.valid_from} → {tariff.valid_until}</div>
                        {(tariff.min_nights || tariff.max_nights) && (
                          <div>
                            Nuits: {tariff.min_nights || 1} - {tariff.max_nights || '∞'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tariff)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tariff.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="windows">
            <RateWindowsTab />
          </TabsContent>

          <TabsContent value="calculator">
            <RateCalculatorPreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}