import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TaxRate {
  type: string;
  rate: number;
  name: string;
  is_inclusive?: boolean;
}

export interface FiscalJurisdiction {
  id: string;
  code: string;
  name: string;
  country_code: string;
  region?: string;
  tax_rates: TaxRate[];
  currency_code: string;
  fiscal_rules: Record<string, any>;
  is_active: boolean;
}

export interface TaxCalculationResult {
  subtotal: number;
  taxBreakdown: {
    type: string;
    name: string;
    rate: number;
    amount: number;
    basis: number;
  }[];
  totalTax: number;
  total: number;
}

export function useFiscalJurisdictions() {
  return useQuery({
    queryKey: ['fiscal-jurisdictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_jurisdictions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as any[];
    }
  });
}

export function useFiscalJurisdiction(jurisdictionId?: string) {
  return useQuery({
    queryKey: ['fiscal-jurisdiction', jurisdictionId],
    queryFn: async () => {
      if (!jurisdictionId) return null;
      
      const { data, error } = await supabase
        .from('fiscal_jurisdictions')
        .select('*')
        .eq('id', jurisdictionId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!jurisdictionId
  });
}

export function useCreateFiscalJurisdiction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<FiscalJurisdiction, 'id'>) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const { data: result, error } = await supabase
        .from('fiscal_jurisdictions')
        .insert({
          ...data,
          org_id: orgData.org_id,
          tax_rates: data.tax_rates as any,
          fiscal_rules: data.fiscal_rules as any
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-jurisdictions'] });
      toast({
        title: "Succès",
        description: "Juridiction fiscale créée avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la juridiction fiscale",
        variant: "destructive"
      });
      console.error('Fiscal jurisdiction error:', error);
    }
  });
}

export function calculateTaxes(
  subtotal: number, 
  jurisdiction: FiscalJurisdiction,
  productType?: string
): TaxCalculationResult {
  const taxBreakdown: TaxCalculationResult['taxBreakdown'] = [];
  let totalTax = 0;
  let calculationBasis = subtotal;

  // Filter tax rates by product type if specified
  const applicableTaxRates = jurisdiction.tax_rates.filter(rate => {
    if (productType && jurisdiction.fiscal_rules.product_tax_mapping) {
      const mapping = jurisdiction.fiscal_rules.product_tax_mapping[productType];
      return !mapping || mapping.includes(rate.type);
    }
    return true;
  });

  // Calculate each tax
  for (const taxRate of applicableTaxRates) {
    const taxAmount = calculationBasis * (taxRate.rate / 100);
    
    taxBreakdown.push({
      type: taxRate.type,
      name: taxRate.name,
      rate: taxRate.rate,
      amount: taxAmount,
      basis: calculationBasis
    });

    totalTax += taxAmount;
    
    // For compound taxes, adjust basis for next calculation
    if (!taxRate.is_inclusive) {
      calculationBasis += taxAmount;
    }
  }

  return {
    subtotal,
    taxBreakdown,
    totalTax,
    total: subtotal + totalTax
  };
}