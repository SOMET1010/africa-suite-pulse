import React, { useState } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, Settings, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useRateWindows } from '../hooks/useRateWindows';
import { useTariffs } from '../hooks/useTariffs';
import { useOrgId } from '@/core/auth/useOrg';
import { toast } from '@/hooks/use-toast';
import { RateWindow, CreateRateWindowData } from '../types/rateWindows';

const initialFormData: CreateRateWindowData = {
  name: '',
  description: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  rate_type: 'percentage',
  adjustment_value: 0,
  min_stay: 1,
  max_stay: undefined,
  applicable_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  client_types: ['individual'],
  room_types: [],
  is_active: true,
  priority: 1
};

export function RateWindowsTab() {
  const { orgId } = useOrgId();
  const { rateWindows, loading, createRateWindow, updateRateWindow, deleteRateWindow } = useRateWindows(orgId || '');
  const { tariffs } = useTariffs(orgId || '');
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWindow, setEditingWindow] = useState<RateWindow | null>(null);
  const [formData, setFormData] = useState<CreateRateWindowData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingWindow) {
        await updateRateWindow.mutateAsync({ id: editingWindow.id, data: formData });
        toast({ title: "Fenêtre tarifaire modifiée avec succès" });
      } else {
        await createRateWindow.mutateAsync(formData);
        toast({ title: "Fenêtre tarifaire créée avec succès" });
      }
      
      setShowCreateDialog(false);
      setEditingWindow(null);
      setFormData(initialFormData);
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder la fenêtre tarifaire",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (rateWindow: RateWindow) => {
    setEditingWindow(rateWindow);
    setFormData({
      name: rateWindow.name,
      description: rateWindow.description || '',
      start_date: rateWindow.start_date,
      end_date: rateWindow.end_date,
      rate_type: rateWindow.rate_type,
      adjustment_value: rateWindow.adjustment_value,
      min_stay: rateWindow.min_stay || 1,
      max_stay: rateWindow.max_stay,
      applicable_days: rateWindow.applicable_days || [],
      client_types: rateWindow.client_types || ['individual'],
      room_types: rateWindow.room_types || [],
      is_active: rateWindow.is_active,
      priority: rateWindow.priority || 1
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette fenêtre tarifaire ?')) {
      try {
        await deleteRateWindow.mutateAsync(id);
        toast({ title: "Fenêtre tarifaire supprimée avec succès" });
      } catch (error) {
        toast({ 
          title: "Erreur", 
          description: "Impossible de supprimer la fenêtre tarifaire",
          variant: "destructive"
        });
      }
    }
  };

  const filteredWindows = rateWindows?.filter(window =>
    window.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAdjustment = (type: string, value: number) => {
    if (type === 'percentage') {
      return `${value > 0 ? '+' : ''}${value}%`;
    }
    return `${value > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR').format(value)} F CFA`;
  };

  const getAdjustmentColor = (value: number) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const dayLabels = {
    monday: 'Lun',
    tuesday: 'Mar', 
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Fenêtres Tarifaires</h2>
          <p className="text-muted-foreground">Gérez les périodes de tarification saisonnière</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            placeholder="Rechercher une fenêtre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Fenêtre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWindow ? 'Modifier la fenêtre tarifaire' : 'Créer une nouvelle fenêtre tarifaire'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom de la fenêtre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Haute saison été"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priorité</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la période tarifaire..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Date de début</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Date de fin</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="rate_type">Type d'ajustement</Label>
                    <Select 
                      value={formData.rate_type} 
                      onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, rate_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage</SelectItem>
                        <SelectItem value="fixed">Montant fixe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="adjustment_value">
                      Valeur d'ajustement {formData.rate_type === 'percentage' ? '(%)' : '(F CFA)'}
                    </Label>
                    <Input
                      id="adjustment_value"
                      type="number"
                      value={formData.adjustment_value}
                      onChange={(e) => setFormData({ ...formData, adjustment_value: parseFloat(e.target.value) })}
                      step={formData.rate_type === 'percentage' ? '0.1' : '1000'}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Actif</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_stay">Séjour minimum (nuits)</Label>
                    <Input
                      id="min_stay"
                      type="number"
                      value={formData.min_stay}
                      onChange={(e) => setFormData({ ...formData, min_stay: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_stay">Séjour maximum (nuits)</Label>
                    <Input
                      id="max_stay"
                      type="number"
                      value={formData.max_stay || ''}
                      onChange={(e) => setFormData({ ...formData, max_stay: parseInt(e.target.value) || undefined })}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Jours de la semaine applicables</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {Object.entries(dayLabels).map(([day, label]) => (
                      <label key={day} className="flex flex-col items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.applicable_days.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                applicable_days: [...formData.applicable_days, day]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                applicable_days: formData.applicable_days.filter(d => d !== day)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Types de clientèle</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 'individual', label: 'Individuel' },
                      { value: 'corporate', label: 'Entreprise' },
                      { value: 'group', label: 'Groupe' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.client_types.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                client_types: [...formData.client_types, type.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                client_types: formData.client_types.filter(t => t !== type.value)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingWindow ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Fenêtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{rateWindows?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fenêtres Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {rateWindows?.filter(w => w.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-accent-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Augmentations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold accent-gold">
              {rateWindows?.filter(w => w.adjustment_value > 0).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-info/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Réductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {rateWindows?.filter(w => w.adjustment_value < 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Windows List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fenêtres Tarifaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredWindows?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune fenêtre tarifaire trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWindows?.map((window) => (
                <div key={window.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{window.name}</h3>
                      <Badge variant={window.is_active ? "default" : "secondary"}>
                        {window.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {window.adjustment_value > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : window.adjustment_value < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Settings className="h-3 w-3" />
                        )}
                        <span className={getAdjustmentColor(window.adjustment_value)}>
                          {formatAdjustment(window.rate_type, window.adjustment_value)}
                        </span>
                      </Badge>
                      <Badge variant="outline">
                        Priorité {window.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Période: {new Date(window.start_date).toLocaleDateString()} → {new Date(window.end_date).toLocaleDateString()}</div>
                      <div>Séjour: {window.min_stay} nuit{window.min_stay > 1 ? 's' : ''} min{window.max_stay ? ` - ${window.max_stay} max` : ''}</div>
                      <div>Jours: {window.applicable_days.map(day => dayLabels[day as keyof typeof dayLabels]).join(', ')}</div>
                      {window.description && <div>Description: {window.description}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(window)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(window.id)}
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
    </div>
  );
}