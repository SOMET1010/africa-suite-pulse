
import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#6b7280',
  '#1e293b', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
  '#2563eb', '#7c3aed', '#db2777', '#475569', '#374151'
];

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4" style={{ color: value === '#ffffff' ? '#000000' : '#ffffff' }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Couleurs prédéfinies</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: color,
                        borderColor: value === color ? '#2563eb' : '#e2e8f0'
                      }}
                      onClick={() => {
                        onChange(color);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Couleur personnalisée</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 h-8 p-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
