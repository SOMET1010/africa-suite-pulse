import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Clock,
  Users,
  Plus,
  Send,
  MessageSquare,
  Utensils,
  CreditCard
} from 'lucide-react';
import type { CartItem } from '../types';

interface MobileServerInterfaceProps {
  serverId?: string;
  items?: CartItem[];
  onAddItem?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onSendToKitchen?: () => void;
  onCheckout?: () => void;
  onAddNote?: (note: string) => void;
}

export function MobileServerInterface({
  serverId,
  items = [],
  onAddItem = () => {},
  onUpdateQuantity = () => {},
  onSendToKitchen = () => {},
  onCheckout = () => {},
  onAddNote = () => {}
}: MobileServerInterfaceProps) {
  const [quickNote, setQuickNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('populaires');

  const popularItems = [
    { id: '1', name: 'Poulet Yassa', price: 3500, code: 'PY001' },
    { id: '2', name: 'Riz Wolof', price: 2500, code: 'RW002' },
    { id: '3', name: 'Bissap', price: 800, code: 'BI003' },
    { id: '4', name: 'Alloco', price: 1500, code: 'AL004' }
  ];

  const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header Mobile */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <Utensils className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Interface Serveur</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Mobile optimisé</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-bold text-lg text-primary">
                {totalAmount.toLocaleString()} F
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSendToKitchen}
              disabled={items.length === 0}
            >
              <Send className="h-4 w-4 mr-1" />
              Cuisine
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCheckout}
              disabled={items.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Encaisser
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {popularItems.map((product) => (
            <Card
              key={product.id}
              className="p-3 cursor-pointer transition-all hover:scale-105 glass-card"
              onClick={() => onAddItem(product.id)}
            >
              <div className="text-center">
                <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.code}</p>
                <div className="font-bold text-primary">{product.price.toLocaleString()} F</div>
                <Button size="sm" className="w-full mt-2 h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Note */}
      <div className="p-4 border-t bg-white/95">
        <div className="flex gap-2">
          <Input
            placeholder="Note rapide..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => {
              if (quickNote.trim()) {
                onAddNote(quickNote);
                setQuickNote('');
              }
            }}
            disabled={!quickNote.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}