import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast-unified";
import { useDebouncedCallback } from "use-debounce";
import { getErrorMessage } from "@/utils/errorHandling";
import type { PaymentTerminal, PaymentTerminalInsert } from "@/types/payments";
import {
  listTerminals,
  upsertTerminal,
  deleteTerminal,
} from "../payments.api";

export function usePaymentTerminals(orgId: string) {
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadTerminals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await listTerminals(orgId);
      if (error) throw error;
      setTerminals(data || []);
    } catch (error: unknown) {
      toast({
        title: "Erreur de chargement",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  useEffect(() => {
    loadTerminals();
  }, [loadTerminals]);

  const debouncedSave = useDebouncedCallback(
    async (terminal: PaymentTerminal | PaymentTerminalInsert, index: number) => {
      const tempId = `temp-${index}`;
      setSaving(prev => ({ ...prev, [terminal.id || tempId]: true }));
      
      try {
        const { data, error } = await upsertTerminal(terminal);
        if (error) throw error;
        
        setTerminals(prev => 
          prev.map((t, i) => 
            i === index ? (data?.[0] || { ...t, ...terminal }) : t
          )
        );
        
        toast({
          title: "Enregistré",
          description: "Terminal sauvegardé",
        });
      } catch (error: unknown) {
        toast({
          title: "Erreur de sauvegarde",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setSaving(prev => ({ ...prev, [terminal.id || tempId]: false }));
      }
    },
    800
  );

  const updateTerminal = useCallback((index: number, updates: Partial<PaymentTerminal>) => {
    setTerminals(prev => {
      const newTerminals = [...prev];
      newTerminals[index] = { ...newTerminals[index], ...updates };
      
      debouncedSave(newTerminals[index], index);
      
      return newTerminals;
    });
  }, [debouncedSave]);

  const addTerminal = useCallback(() => {
    const newTerminal: PaymentTerminalInsert = {
      org_id: orgId,
      name: "",
      provider: "",
      device_id: "",
      take_commission: true,
      active: true,
    };
    setTerminals(prev => [...prev, newTerminal as PaymentTerminal]);
  }, [orgId]);

  const removeTerminal = useCallback(async (id: string, index: number) => {
    try {
      await deleteTerminal(id);
      setTerminals(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Supprimé",
        description: "Terminal supprimé",
      });
    } catch (error: unknown) {
      toast({
        title: "Erreur de suppression",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    terminals,
    loading,
    saving,
    updateTerminal,
    addTerminal,
    removeTerminal,
    refresh: loadTerminals,
  };
}