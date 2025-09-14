import React from 'react';
import { Hash, Home, Users, TrendingUp } from 'lucide-react';

interface StatsProps {
  totalTypes: number;
  totalRooms: number;
  totalCapacity: number;
  averageCapacity: number;
}

export function RoomTypeStats({ totalTypes, totalRooms, totalCapacity, averageCapacity }: StatsProps) {
  const stats = [
    {
      icon: Hash,
      label: 'Types configurés',
      value: totalTypes,
      color: 'primary'
    },
    {
      icon: Home,
      label: 'Chambres total',
      value: totalRooms,
      color: 'success'
    },
    {
      icon: Users,
      label: 'Capacité totale',
      value: totalCapacity,
      color: 'secondary'
    },
    {
      icon: TrendingUp,
      label: 'Capacité moyenne',
      value: averageCapacity.toFixed(1),
      color: 'accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-xl
                ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : ''}
                ${stat.color === 'success' ? 'bg-success/10 text-success' : ''}
                ${stat.color === 'secondary' ? 'bg-secondary/10 text-secondary-foreground' : ''}
                ${stat.color === 'accent' ? 'bg-accent/10 text-accent-foreground' : ''}
              `}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}