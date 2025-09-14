import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ClickableKPICardProps {
  title: string;
  value: number;
  change: number;
  suffix?: string;
  isLoading?: boolean;
  onClick?: () => void;
  detailRoute?: string;
  className?: string;
}

export function ClickableKPICard({ 
  title, 
  value, 
  change, 
  suffix = "", 
  isLoading = false, 
  onClick,
  detailRoute,
  className = ""
}: ClickableKPICardProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (detailRoute) {
      navigate(detailRoute);
    }
  };

  if (isLoading) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`glass-card hover:shadow-luxury hover:scale-105 transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold group-hover:text-primary transition-colors">
              {suffix === 'XOF' ? formatCurrency(value) : 
               typeof value === 'number' && value > 1000 && suffix !== '%' 
                ? `${(value / 1000).toFixed(0)}k${suffix}` 
                : `${value}${suffix}`}
            </p>
            <div className={`flex items-center gap-1 text-xs ${
              change >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span className="font-medium">{Math.abs(change).toFixed(1)}% vs hier</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-50 group-hover:opacity-100" />
          </div>
        </div>
        
        {/* Hover indicator */}
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}