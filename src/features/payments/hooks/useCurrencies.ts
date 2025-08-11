import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "use-debounce";
import type { Currency, CurrencyInsert } from "@/types/payments";
import {
  listCurrencies,
  upsertCurrency,
  deleteCurrency,
} from "../payments.api";

export function useCurrencies(orgId: string) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await listCurrencies(orgId);
      if (error) throw error;
      setCurrencies(data || []);
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
    loadCurrencies();
  }, [loadCurrencies]);

  const debouncedSave = useDebouncedCallback(
    async (currency: Currency | CurrencyInsert, index: number) => {
      const tempId = `temp-${index}`;
      setSaving(prev => ({ ...prev, [currency.id || tempId]: true }));
      
      try {
        const { data, error } = await upsertCurrency(currency);
        if (error) throw error;
        
        setCurrencies(prev => 
          prev.map((c, i) => 
            i === index ? (data?.[0] || { ...c, ...currency }) : c
          )
        );
        
        toast({
          title: "Enregistré",
          description: "Devise sauvegardée",
        });
      } catch (error: any) {
        toast({
          title: "Erreur de sauvegarde",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setSaving(prev => ({ ...prev, [currency.id || tempId]: false }));
      }
    },
    800
  );

  const updateCurrency = useCallback((index: number, updates: Partial<Currency>) => {
    setCurrencies(prev => {
      const newCurrencies = [...prev];
      newCurrencies[index] = { ...newCurrencies[index], ...updates };
      
      debouncedSave(newCurrencies[index], index);
      
      return newCurrencies;
    });
  }, [debouncedSave]);

  const addCurrency = useCallback(() => {
    const newCurrency: CurrencyInsert = {
      org_id: orgId,
      code: "",
      label: "",
      rate_to_base: 1,
      is_base: false,
      active: true,
    };
    setCurrencies(prev => [...prev, newCurrency as Currency]);
  }, [orgId]);

  const removeCurrency = useCallback(async (id: string, index: number) => {
    try {
      await deleteCurrency(id);
      setCurrencies(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Supprimé",
        description: "Devise supprimée",
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
    currencies,
    loading,
    saving,
    updateCurrency,
    addCurrency,
    removeCurrency,
    refresh: loadCurrencies,
  };
}