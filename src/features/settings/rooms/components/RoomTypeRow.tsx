import React from 'react';
import { Trash2 } from 'lucide-react';
import { RoomTypeWithStock } from '../roomTypesService';

interface RoomTypeRowProps {
  type: RoomTypeWithStock & { 
    hasErrors?: boolean; 
    errors?: Record<string, string>;
    isNew?: boolean;
  };
  index: number;
  onUpdate: (index: number, updates: Partial<RoomTypeWithStock>) => void;
  onDelete: (index: number) => void;
}

export function RoomTypeRow({ type, index, onUpdate, onDelete }: RoomTypeRowProps) {
  return (
    <tr className={`
      hover:bg-muted/50 transition-colors
      ${type.isNew ? 'bg-accent/20' : ''}
      ${type.hasErrors ? 'bg-destructive/5' : ''}
    `}>
      {/* Code */}
      <td className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            value={type.code || ''}
            onChange={(e) => onUpdate(index, { code: e.target.value.toUpperCase() })}
            className={`
              w-16 px-3 py-2 text-center font-mono font-bold text-lg 
              border-2 rounded-lg bg-background
              ${type.errors?.code 
                ? 'border-destructive focus:border-destructive' 
                : 'border-border focus:border-primary'
              }
              focus:outline-none transition-colors
            `}
            maxLength={1}
            placeholder="S"
          />
          {type.errors?.code && (
            <div className="absolute top-full left-0 mt-1 text-xs text-destructive">
              {type.errors.code}
            </div>
          )}
        </div>
      </td>

      {/* Libellé */}
      <td className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            value={type.label || ''}
            onChange={(e) => onUpdate(index, { label: e.target.value })}
            className={`
              w-full px-3 py-2 border-2 rounded-lg bg-background
              ${type.errors?.label 
                ? 'border-destructive focus:border-destructive' 
                : 'border-border focus:border-primary'
              }
              focus:outline-none transition-colors
            `}
            maxLength={50}
            placeholder="Standard"
          />
          <div className="absolute top-full left-0 mt-1 flex justify-between w-full">
            {type.errors?.label && (
              <span className="text-xs text-destructive">{type.errors.label}</span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {(type.label || '').length}/50
            </span>
          </div>
        </div>
      </td>

      {/* Capacité */}
      <td className="px-4 py-3">
        <div className="relative">
          <input
            type="number"
            value={type.capacity || ''}
            onChange={(e) => onUpdate(index, { capacity: parseInt(e.target.value) || 1 })}
            className={`
              w-20 px-3 py-2 text-center border-2 rounded-lg bg-background
              ${type.errors?.capacity 
                ? 'border-destructive focus:border-destructive' 
                : 'border-border focus:border-primary'
              }
              focus:outline-none transition-colors
            `}
            min={1}
            max={10}
          />
          {type.errors?.capacity && (
            <div className="absolute top-full left-0 mt-1 text-xs text-destructive">
              {type.errors.capacity}
            </div>
          )}
        </div>
      </td>

      {/* Stock */}
      <td className="px-4 py-3 text-center">
        <span className={`
          inline-block px-3 py-1 rounded-full text-sm font-medium
          ${(type.stock || 0) > 0 
            ? 'bg-success/10 text-success' 
            : 'bg-muted text-muted-foreground'
          }
        `}>
          {type.stock || 0}
        </span>
      </td>

      {/* Note */}
      <td className="px-4 py-3">
        <textarea
          value={type.note || ''}
          onChange={(e) => onUpdate(index, { note: e.target.value })}
          className="w-full px-3 py-2 border-2 border-border focus:border-primary rounded-lg resize-none focus:outline-none bg-background"
          rows={2}
          placeholder="Description..."
          maxLength={200}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {(type.note || '').length}/200
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(index)}
          disabled={type.stock && type.stock > 0}
          className={`
            p-2 rounded-lg transition-colors
            ${type.stock && type.stock > 0
              ? 'text-muted-foreground cursor-not-allowed'
              : 'text-destructive hover:bg-destructive/10'
            }
          `}
          title={type.stock && type.stock > 0 ? 'Type utilisé par des chambres' : 'Supprimer'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}