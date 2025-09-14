import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  CreditCard,
  Calendar,
  Mail,
  Download,
  Settings,
} from 'lucide-react';
import {
  useGeneratePoliceForm,
  useGenerateRoomCard,
  useGenerateStayProgram,
  useEmailDocument,
} from '../hooks/useArrivalDocuments';
import type { ArrivalRow } from '../arrivals.types';

interface DocumentActionsMenuProps {
  arrival: ArrivalRow;
  trigger: React.ReactNode;
}

interface DocumentOptions {
  template: string;
  cardType: 'magnetic' | 'qr' | 'pin';
  includeServices: boolean;
  email: string;
}

export function DocumentActionsMenu({ arrival, trigger }: DocumentActionsMenuProps) {
  const [optionsDialog, setOptionsDialog] = useState<{
    open: boolean;
    type: 'police_form' | 'room_card' | 'stay_program' | null;
    action: 'generate' | 'email' | null;
  }>({
    open: false,
    type: null,
    action: null,
  });

  const [options, setOptions] = useState<DocumentOptions>({
    template: 'default',
    cardType: 'qr',
    includeServices: true,
    email: '',
  });

  const generatePoliceForm = useGeneratePoliceForm();
  const generateRoomCard = useGenerateRoomCard();
  const generateStayProgram = useGenerateStayProgram();
  const emailDocument = useEmailDocument();

  const handleGenerate = (type: 'police_form' | 'room_card' | 'stay_program') => {
    switch (type) {
      case 'police_form':
        generatePoliceForm.mutate({
          reservationId: arrival.id,
          template: options.template,
        });
        break;
      case 'room_card':
        generateRoomCard.mutate({
          reservationId: arrival.id,
          template: options.template,
          cardType: options.cardType,
        });
        break;
      case 'stay_program':
        generateStayProgram.mutate({
          reservationId: arrival.id,
          template: options.template,
          includeServices: options.includeServices,
        });
        break;
    }
    setOptionsDialog({ open: false, type: null, action: null });
  };

  const handleEmail = (type: 'police_form' | 'room_card' | 'stay_program') => {
    if (!options.email.trim()) {
      return;
    }

    const additionalOptions: any = { template: options.template };
    
    if (type === 'room_card') {
      additionalOptions.cardType = options.cardType;
    } else if (type === 'stay_program') {
      additionalOptions.includeServices = options.includeServices;
    }

    emailDocument.mutate({
      reservationId: arrival.id,
      documentType: type,
      email: options.email,
      additionalOptions,
    });
    
    setOptionsDialog({ open: false, type: null, action: null });
  };

  const openOptionsDialog = (type: 'police_form' | 'room_card' | 'stay_program', action: 'generate' | 'email') => {
    setOptionsDialog({ open: true, type, action });
  };

  const handleDialogAction = () => {
    if (!optionsDialog.type || !optionsDialog.action) return;
    
    if (optionsDialog.action === 'generate') {
      handleGenerate(optionsDialog.type);
    } else {
      handleEmail(optionsDialog.type);
    }
  };

  const getDialogTitle = () => {
    const docName = optionsDialog.type === 'police_form' ? 'Fiche de police' :
                    optionsDialog.type === 'room_card' ? 'Carte de chambre' :
                    'Programme de séjour';
    const actionName = optionsDialog.action === 'generate' ? 'Générer' : 'Envoyer par email';
    return `${actionName} - ${docName}`;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Police Form */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 h-4 w-4" />
              Fiche de police
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => openOptionsDialog('police_form', 'generate')}>
                <Download className="mr-2 h-4 w-4" />
                Générer PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openOptionsDialog('police_form', 'email')}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Room Card */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CreditCard className="mr-2 h-4 w-4" />
              Carte de chambre
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => openOptionsDialog('room_card', 'generate')}>
                <Download className="mr-2 h-4 w-4" />
                Générer carte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openOptionsDialog('room_card', 'email')}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Stay Program */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="mr-2 h-4 w-4" />
              Programme de séjour
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => openOptionsDialog('stay_program', 'generate')}>
                <Download className="mr-2 h-4 w-4" />
                Générer programme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openOptionsDialog('stay_program', 'email')}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Options Dialog */}
      <Dialog open={optionsDialog.open} onOpenChange={(open) => !open && setOptionsDialog({ open: false, type: null, action: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={options.template} onValueChange={(value) => setOptions(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Par défaut</SelectItem>
                  <SelectItem value="elegant">Élégant</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card Type (only for room cards) */}
            {optionsDialog.type === 'room_card' && (
              <div className="space-y-2">
                <Label htmlFor="cardType">Type de carte</Label>
                <Select value={options.cardType} onValueChange={(value: any) => setOptions(prev => ({ ...prev, cardType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qr">QR Code</SelectItem>
                    <SelectItem value="pin">Code PIN</SelectItem>
                    <SelectItem value="magnetic">Magnétique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Include Services (only for stay program) */}
            {optionsDialog.type === 'stay_program' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeServices"
                  checked={options.includeServices}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeServices: !!checked }))}
                />
                <Label htmlFor="includeServices">Inclure la liste des services disponibles</Label>
              </div>
            )}

            {/* Email (only for email actions) */}
            {optionsDialog.action === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={options.email}
                  onChange={(e) => setOptions(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOptionsDialog({ open: false, type: null, action: null })}>
              Annuler
            </Button>
            <Button 
              onClick={handleDialogAction}
              disabled={optionsDialog.action === 'email' && !options.email.trim()}
            >
              {optionsDialog.action === 'generate' ? 'Générer' : 'Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}