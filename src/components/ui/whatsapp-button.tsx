import React, { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/toast-unified';

interface WhatsAppButtonProps {
  reservationId: string;
  action: 'confirmation' | 'modification' | 'cancellation' | 'checkin';
  customMessage?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function WhatsAppButton({
  reservationId,
  action,
  customMessage,
  variant = 'outline',
  size = 'sm',
  className,
  children
}: WhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const sendWhatsApp = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          reservationId,
          action,
          customMessage
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "WhatsApp envoyé",
        description: `Message ${action} envoyé avec succès`,
        variant: "success"
      });

    } catch (error: any) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: "Erreur WhatsApp",
        description: error.message || "Impossible d'envoyer le message WhatsApp",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={sendWhatsApp}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4" />
      )}
      {children || "WhatsApp"}
    </Button>
  );
}