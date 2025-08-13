import React from 'react';
import { Badge } from './ui/Badge';

export function ColorTest() {
  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border max-w-xs">
      <h3 className="text-sm font-bold mb-2">Test des couleurs</h3>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-success rounded"></div>
          <div className="w-4 h-4 bg-info rounded"></div>
          <div className="w-4 h-4 bg-warning rounded"></div>
          <div className="w-4 h-4 bg-danger rounded"></div>
        </div>
        
        <div className="flex gap-1">
          <div className="w-3 h-3 room-dot-clean rounded-full"></div>
          <div className="w-3 h-3 room-dot-inspected rounded-full"></div>
          <div className="w-3 h-3 room-dot-dirty rounded-full"></div>
          <div className="w-3 h-3 room-dot-maintenance rounded-full"></div>
          <div className="w-3 h-3 room-dot-out_of_order rounded-full"></div>
        </div>
        
        <div className="space-y-1">
          <Badge className="bg-green-500/25 text-green-800 border-green-500/50">Vert</Badge>
          <Badge className="bg-blue-500/25 text-blue-800 border-blue-500/50">Bleu</Badge>
          <Badge className="bg-orange-500/25 text-orange-800 border-orange-500/50">Orange</Badge>
        </div>
      </div>
    </div>
  );
}