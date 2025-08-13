import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/toast-unified";
import { useDebouncedCallback } from "use-debounce";
import type { PaymentMethod, PaymentMethodInsert } from "@/types/payments";
import {
  listPaymentMethods,
  upsertPaymentMethod,
  deletePaymentMethod,
} from "../payments.api";

export function usePaymentMethods(orgId: string) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadMethods = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await listPaymentMethods(orgId);
      if (error) throw error;
      setMethods(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const debouncedSave = useDebouncedCallback(
    async (method: PaymentMethod | PaymentMethodInsert, index: number) => {
      const tempId = `temp-${index}`;
      setSaving(prev => ({ ...prev, [method.id || tempId]: true }));
      
      try {
        const { data, error } = await upsertPaymentMethod(method);
        if (error) throw error;
        
        // Update the local state with the saved data
        setMethods(prev => 
          prev.map((m, i) => 
            i === index ? (data?.[0] || { ...m, ...method }) : m
          )
        );
        
        toast({
          title: "Enregistré",
          description: "Méthode de paiement sauvegardée",
        });
      } catch (error: any) {
        toast({
          title: "Erreur de sauvegarde",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setSaving(prev => ({ ...prev, [method.id || tempId]: false }));
      }
    },
    800
  );

  const updateMethod = useCallback((index: number, updates: Partial<PaymentMethod>) => {
    setMethods(prev => {
      const newMethods = [...prev];
      newMethods[index] = { ...newMethods[index], ...updates };
      
      // Auto-save after update
      debouncedSave(newMethods[index], index);
      
      return newMethods;
    });
  }, [debouncedSave]);

  const addMethod = useCallback(() => {
    const newMethod: PaymentMethodInsert = {
      org_id: orgId,
      code: "",
      label: "",
      kind: "card",
      commission_percent: 0,
      active: true,
    };
    setMethods(prev => [...prev, newMethod as PaymentMethod]);
  }, [orgId]);

  const removeMethod = useCallback(async (id: string, index: number) => {
    try {
      await deletePaymentMethod(id);
      setMethods(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Supprimé",
        description: "Méthode de paiement supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de suppression",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    methods,
    loading,
    saving,
    updateMethod,
    addMethod,
    removeMethod,
    refresh: loadMethods,
  };
}