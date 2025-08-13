import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { useRoomTypesLookup } from '../hooks/useRoomTypesLookup';
import { useOrgId } from '@/core/auth/useOrg';

interface RoomTypeIndicatorProps {
  typeCode: string;
  typeName?: string;
  compact?: boolean;
}

export function RoomTypeIndicator({ typeCode, typeName, compact = false }: RoomTypeIndicatorProps) {
  const { orgId } = useOrgId();
  const { getRoomTypeName } = useRoomTypesLookup(orgId || '');
  
  const displayName = typeName || getRoomTypeName(typeCode);
  // Configuration des couleurs par type de chambre
  const getTypeColor = (code: string) => {
    // Génère une couleur basée sur le hash du code
    const hash = code.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue = Math.abs(hash) % 360;
    return {
      bg: `hsl(${hue} 65% 92%)`,
      border: `hsl(${hue} 65% 60%)`,
      text: `hsl(${hue} 65% 25%)`
    };
  };

  const colors = getTypeColor(typeCode);
  
  if (compact) {
    return (
      <div 
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          color: colors.text
        }}
        title={displayName}
      >
        {typeCode.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Badge 
      variant="outline"
      className="border-2 font-medium"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text
      }}
    >
{displayName !== typeCode ? displayName : typeCode}
    </Badge>
  );
}