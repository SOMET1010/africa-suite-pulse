import React, { useState } from "react";
import { Calendar, Clock, Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useHotelDate, useSwitchHotelDate } from "@/features/settings/hooks/useHotelDate";
import { useOrgId } from "@/core/auth/useOrg";
import { useUserRole } from "@/core/auth/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HotelDateWidgetProps {
  className?: string;
}

export function HotelDateWidget({ className }: HotelDateWidgetProps) {
  const { orgId } = useOrgId();
  const { role } = useUserRole();
  const { data: hotelDate, isLoading } = useHotelDate(orgId);
  const switchHotelDate = useSwitchHotelDate(orgId);
  const { toast } = useToast();
  
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const canManageDate = role === 'admin' || role === 'manager';

  if (isLoading || !hotelDate) {
    return (
      <div className={cn(
        "glass-card px-3 py-2 rounded-lg border border-accent-gold/20 shadow-soft",
        className
      )}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground animate-pulse" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(dateStr));
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // Remove seconds
  };

  const getProtectionStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const hotelDateStr = hotelDate.currentHotelDate;
    
    if (hotelDateStr < today) {
      return { icon: ShieldAlert, color: "text-amber-500", label: "Données protégées" };
    } else if (hotelDateStr === today) {
      return { icon: ShieldCheck, color: "text-emerald-500", label: "Données actuelles" };
    } else {
      return { icon: Shield, color: "text-blue-500", label: "Données futures" };
    }
  };

  const handleSwitchDate = async () => {
    try {
      await switchHotelDate.mutateAsync();
      toast({
        title: "Date-Hôtel basculée",
        description: "La date-hôtel a été avancée avec succès.",
        variant: "default"
      });
      setShowSwitchDialog(false);
    } catch (error) {
      toast({
        title: "Erreur lors de la bascule",
        description: "Impossible de basculer la date-hôtel. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const protectionStatus = getProtectionStatus();
  const ProtectionIcon = protectionStatus.icon;

  return (
    <>
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "glass-card px-3 py-2 h-auto border border-accent-gold/20 shadow-soft",
              "hover:shadow-luxury transition-elegant",
              className
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-accent" />
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-charcoal">
                    {formatDate(hotelDate.currentHotelDate)}
                  </span>
                  <ProtectionIcon className={cn("w-3 h-3", protectionStatus.color)} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{hotelDate.mode === 'noon' ? 'Midi' : 'Minuit'}</span>
                  <span>→ {formatTime(hotelDate.autoSwitchTime)}</span>
                </div>
              </div>
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-accent" />
              Date-Hôtel Système
            </DialogTitle>
            <DialogDescription>
              Configuration et statut de la date-hôtel pour les opérations quotidiennes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Date Courante</div>
                <div className="text-lg font-bold text-charcoal">
                  {new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  }).format(new Date(hotelDate.currentHotelDate))}
                </div>
              </div>
              
              <div className="glass-card p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Mode Bascule</div>
                <div className="text-lg font-bold text-charcoal capitalize">
                  {hotelDate.mode === 'noon' ? 'Midi' : 'Minuit'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Prochaine: {formatTime(hotelDate.autoSwitchTime)}
                </div>
              </div>
            </div>
            
            <div className="glass-card p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ProtectionIcon className={cn("w-4 h-4", protectionStatus.color)} />
                <span className="text-sm font-medium">{protectionStatus.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {protectionStatus.label === "Données protégées" 
                  ? "Les modifications nécessitent des contre-passations"
                  : protectionStatus.label === "Données actuelles"
                  ? "Toutes les opérations sont autorisées"
                  : "Données en mode futur"
                }
              </div>
            </div>
            
            {canManageDate && (
              <div className="pt-2 border-t">
                <Button 
                  onClick={() => setShowSwitchDialog(true)}
                  disabled={switchHotelDate.isPending}
                  className="w-full"
                  variant="default"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Basculer Date-Hôtel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la bascule Date-Hôtel</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Vous êtes sur le point de faire basculer la date-hôtel au jour suivant.
              </p>
              <div className="glass-card p-3 rounded-lg bg-amber-50 border-amber-200">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ Cette action aura les effets suivants :
                </p>
                <ul className="text-xs text-amber-700 mt-1 space-y-1">
                  <li>• Les données de la date précédente deviennent protégées</li>
                  <li>• Les modifications antérieures nécessiteront des contre-passations</li>
                  <li>• Les calculs de revenus et rapports seront mis à jour</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSwitchDate}
              disabled={switchHotelDate.isPending}
              className="bg-brand-accent hover:bg-brand-accent/90"
            >
              {switchHotelDate.isPending ? "Bascule..." : "Confirmer la bascule"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}