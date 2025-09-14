import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { 
  Package, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Shirt,
  Bed,
  Droplets,
  Calendar
} from 'lucide-react';
import { LinenInventory, LinenChangeDetails, LinenStatus } from '../types';

interface LinenManagementProps {
  roomId: string;
  roomNumber: string;
  currentLinenStatus: LinenStatus;
  onLinenChange: (details: LinenChangeDetails) => void;
}

export function LinenManagement({ roomId, roomNumber, currentLinenStatus, onLinenChange }: LinenManagementProps) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [changeDetails, setChangeDetails] = useState<Partial<LinenChangeDetails>>({
    bed_linen: false,
    bathroom_linen: false,
    pillowcases: 0,
    sheets: 0,
    towels: 0,
    bathrobes: 0,
    linen_condition: 'good',
    replacement_reason: 'schedule'
  });

  // Mock data for linen inventory
  const mockLinenInventory: LinenInventory[] = [
    {
      id: '1',
      type: 'bed_sheet',
      size: 'queen',
      quantity_available: 24,
      quantity_in_use: 45,
      quantity_in_laundry: 12,
      quality_grade: 'A',
      last_restocked: '2024-01-10',
      org_id: 'org-1'
    },
    {
      id: '2',
      type: 'towel',
      size: 'large',
      quantity_available: 18,
      quantity_in_use: 32,
      quantity_in_laundry: 8,
      quality_grade: 'A',
      last_restocked: '2024-01-12',
      org_id: 'org-1'
    },
    {
      id: '3',
      type: 'pillowcase',
      size: 'medium',
      quantity_available: 30,
      quantity_in_use: 90,
      quantity_in_laundry: 15,
      quality_grade: 'B',
      last_restocked: '2024-01-08',
      org_id: 'org-1'
    }
  ];

  const getLinenStatusColor = (status: LinenStatus['linen_quality']) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'acceptable': return 'bg-yellow-100 text-yellow-800';
      case 'needs_replacement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 30) return 'bg-green-100 text-green-800';
    if (percentage > 15) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleLinenChange = () => {
    const details: LinenChangeDetails = {
      bed_linen: changeDetails.bed_linen || false,
      bathroom_linen: changeDetails.bathroom_linen || false,
      pillowcases: changeDetails.pillowcases || 0,
      sheets: changeDetails.sheets || 0,
      towels: changeDetails.towels || 0,
      bathrobes: changeDetails.bathrobes || 0,
      linen_condition: changeDetails.linen_condition || 'good',
      replacement_reason: changeDetails.replacement_reason || 'schedule',
      previous_linen_id: `linen_${roomId}_${Date.now()}`,
      new_linen_id: `linen_${roomId}_${Date.now() + 1}`
    };

    onLinenChange(details);
    setIsChangeDialogOpen(false);
    setChangeDetails({
      bed_linen: false,
      bathroom_linen: false,
      pillowcases: 0,
      sheets: 0,
      towels: 0,
      bathrobes: 0,
      linen_condition: 'good',
      replacement_reason: 'schedule'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Linen Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Statut du linge - Chambre {roomNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Linge de lit</span>
                <div className="flex items-center gap-2">
                  <Badge className={getLinenStatusColor(currentLinenStatus.linen_quality)}>
                    {currentLinenStatus.linen_quality}
                  </Badge>
                  {currentLinenStatus.needs_bed_linen_change && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Dernière change: {new Date(currentLinenStatus.bed_linen_last_changed).toLocaleDateString('fr-FR')} 
                ({currentLinenStatus.days_since_bed_change} jours)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Linge de bain</span>
                <div className="flex items-center gap-2">
                  <Badge className={getLinenStatusColor(currentLinenStatus.linen_quality)}>
                    {currentLinenStatus.linen_quality}
                  </Badge>
                  {currentLinenStatus.needs_bathroom_linen_change && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Dernière change: {new Date(currentLinenStatus.bathroom_linen_last_changed).toLocaleDateString('fr-FR')} 
                ({currentLinenStatus.days_since_bathroom_change} jours)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Changer le linge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Changement de linge - Ch. {roomNumber}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bed_linen"
                        checked={changeDetails.bed_linen}
                        onCheckedChange={(checked) => setChangeDetails({...changeDetails, bed_linen: !!checked})}
                      />
                      <Label htmlFor="bed_linen">Linge de lit</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bathroom_linen"
                        checked={changeDetails.bathroom_linen}
                        onCheckedChange={(checked) => setChangeDetails({...changeDetails, bathroom_linen: !!checked})}
                      />
                      <Label htmlFor="bathroom_linen">Linge de bain</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sheets">Draps</Label>
                      <Input
                        id="sheets"
                        type="number"
                        min="0"
                        value={changeDetails.sheets}
                        onChange={(e) => setChangeDetails({...changeDetails, sheets: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pillowcases">Taies</Label>
                      <Input
                        id="pillowcases"
                        type="number"
                        min="0"
                        value={changeDetails.pillowcases}
                        onChange={(e) => setChangeDetails({...changeDetails, pillowcases: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="towels">Serviettes</Label>
                      <Input
                        id="towels"
                        type="number"
                        min="0"
                        value={changeDetails.towels}
                        onChange={(e) => setChangeDetails({...changeDetails, towels: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrobes">Peignoirs</Label>
                      <Input
                        id="bathrobes"
                        type="number"
                        min="0"
                        value={changeDetails.bathrobes}
                        onChange={(e) => setChangeDetails({...changeDetails, bathrobes: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>État du linge retiré</Label>
                    <Select
                      value={changeDetails.linen_condition}
                      onValueChange={(value: any) => setChangeDetails({...changeDetails, linen_condition: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Bon état</SelectItem>
                        <SelectItem value="worn">Usé</SelectItem>
                        <SelectItem value="stained">Taché</SelectItem>
                        <SelectItem value="damaged">Endommagé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Raison du changement</Label>
                    <Select
                      value={changeDetails.replacement_reason}
                      onValueChange={(value: any) => setChangeDetails({...changeDetails, replacement_reason: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="schedule">Planning régulier</SelectItem>
                        <SelectItem value="checkout">Après départ</SelectItem>
                        <SelectItem value="guest_request">Demande client</SelectItem>
                        <SelectItem value="stained">Linge taché</SelectItem>
                        <SelectItem value="damaged">Linge endommagé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleLinenChange} className="flex-1">
                      Confirmer le changement
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangeDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Linen Inventory Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock de linge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockLinenInventory.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {item.type === 'bed_sheet' && 'Draps'}
                    {item.type === 'towel' && 'Serviettes'}
                    {item.type === 'pillowcase' && 'Taies d\'oreiller'}
                  </h4>
                  <Badge className={getInventoryStatusColor(item.quantity_available, item.quantity_available + item.quantity_in_use)}>
                    {item.quality_grade}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Disponible: {item.quantity_available}</p>
                  <p>En usage: {item.quantity_in_use}</p>
                  <p>En lavage: {item.quantity_in_laundry}</p>
                  <p>Taille: {item.size}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}