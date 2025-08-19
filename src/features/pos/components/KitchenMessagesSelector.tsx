import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface KitchenMessage {
  id: string;
  category: string;
  message_text: string;
  icon: string;
  color: string;
  is_priority: boolean;
}

interface KitchenMessagesSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (messages: string[], customMessage?: string) => void;
  selectedMessages?: string[];
}

export function KitchenMessagesSelector({
  isOpen,
  onClose,
  onConfirm,
  selectedMessages = []
}: KitchenMessagesSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedMessages);
  const [customMessage, setCustomMessage] = useState('');
  const [activeTab, setActiveTab] = useState('cooking');

  const { data: messages = [] } = useQuery({
    queryKey: ['kitchen-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_kitchen_messages')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as KitchenMessage[];
    },
    enabled: isOpen
  });

  const messagesByCategory = messages.reduce((acc, message) => {
    if (!acc[message.category]) {
      acc[message.category] = [];
    }
    acc[message.category].push(message);
    return acc;
  }, {} as Record<string, KitchenMessage[]>);

  const categories = Object.keys(messagesByCategory);

  const toggleMessage = (messageId: string) => {
    setSelected(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selected, customMessage.trim() || undefined);
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      cooking: 'Cuisson',
      allergy: 'Allergies',
      special: 'Spécial',
      timing: 'Timing'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      cooking: '🔥',
      allergy: '⚠️',
      special: '✨',
      timing: '⏰'
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages pour la cuisine
            {selected.length > 0 && (
              <Badge variant="secondary">{selected.length} sélectionné(s)</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex items-center gap-1">
                  <span>{getCategoryIcon(category)}</span>
                  {getCategoryLabel(category)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto space-y-4">
              {categories.map(category => (
                <TabsContent key={category} value={category} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {messagesByCategory[category]?.map(message => {
                      const isSelected = selected.includes(message.id);
                      return (
                        <Button
                          key={message.id}
                          variant={isSelected ? "default" : "outline"}
                          className="justify-start h-auto p-3 relative"
                          onClick={() => toggleMessage(message.id)}
                          style={{
                            borderColor: isSelected ? message.color : undefined,
                            backgroundColor: isSelected ? message.color + '20' : undefined
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-lg">{message.icon}</span>
                            <span className="text-sm">{message.message_text}</span>
                          </div>
                          {message.is_priority && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                      !
                    </Badge>
                          )}
                          {isSelected && (
                            <X className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div>
            <Label htmlFor="custom-message" className="text-sm font-medium">
              Message personnalisé
            </Label>
            <Textarea
              id="custom-message"
              placeholder="Ajouter des instructions spécifiques..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}