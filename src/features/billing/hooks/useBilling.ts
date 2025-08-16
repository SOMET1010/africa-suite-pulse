// Hooks React Query pour la facturation - Phase 1 refactoring
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import {
  createInvoice,
  getInvoiceById,
  listInvoices,
  updateInvoice,
  deleteInvoice,
  getBillingStats
} from "../api/billing.api";
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  BillingFilters
} from "../types/billing.types";

// ============= QUERY KEYS =============
export const billingKeys = {
  all: ['billing'] as const,
  stats: (orgId: string) => [...billingKeys.all, 'stats', orgId] as const,
  invoices: (orgId: string) => [...billingKeys.all, 'invoices', orgId] as const,
  invoicesList: (orgId: string, filters: BillingFilters) => 
    [...billingKeys.invoices(orgId), 'list', filters] as const,
  invoice: (id: string) => [...billingKeys.all, 'invoice', id] as const,
};

// ============= STATS HOOK =============
export function useBillingStats() {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: billingKeys.stats(orgId || ''),
    queryFn: () => getBillingStats(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.data
  });
}

// ============= INVOICES LIST HOOK =============
export function useInvoicesList(filters: BillingFilters = {}, limit = 50, offset = 0) {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: billingKeys.invoicesList(orgId || '', filters),
    queryFn: () => listInvoices(orgId!, filters, limit, offset),
    enabled: !!orgId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => ({
      invoices: data.data || [],
      count: data.count || 0,
      hasMore: data.has_more || false,
      error: data.error
    })
  });
}

// ============= SINGLE INVOICE HOOK =============
export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: billingKeys.invoice(invoiceId || ''),
    queryFn: () => getInvoiceById(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.data
  });
}

// ============= MUTATIONS =============

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (response) => {
      if (response.data) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: billingKeys.invoices(orgId || '') });
        queryClient.invalidateQueries({ queryKey: billingKeys.stats(orgId || '') });
        
        toast({
          title: "Facture créée",
          description: `Facture ${response.data.number} créée avec succès`,
        });
      } else if (response.error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la facture",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      logger.error('Create invoice error', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ invoiceId, updates }: { invoiceId: string; updates: UpdateInvoiceInput }) =>
      updateInvoice(invoiceId, updates),
    onSuccess: (response, variables) => {
      if (response.data) {
        // Invalidate and update specific invoice
        queryClient.invalidateQueries({ queryKey: billingKeys.invoice(variables.invoiceId) });
        queryClient.invalidateQueries({ queryKey: billingKeys.invoices(orgId || '') });
        queryClient.invalidateQueries({ queryKey: billingKeys.stats(orgId || '') });
        
        toast({
          title: "Facture mise à jour",
          description: "Les modifications ont été enregistrées",
        });
      } else if (response.error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la facture",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      logger.error('Update invoice error', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: (response, invoiceId) => {
      if (response.data) {
        // Remove from cache and invalidate lists
        queryClient.removeQueries({ queryKey: billingKeys.invoice(invoiceId) });
        queryClient.invalidateQueries({ queryKey: billingKeys.invoices(orgId || '') });
        queryClient.invalidateQueries({ queryKey: billingKeys.stats(orgId || '') });
        
        toast({
          title: "Facture supprimée",
          description: "La facture a été supprimée avec succès",
        });
      } else if (response.error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la facture",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      logger.error('Delete invoice error', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    },
  });
}

// ============= OPTIMISTIC UPDATES =============

export function useOptimisticInvoiceUpdate() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();

  const updateInvoiceOptimistically = (invoiceId: string, updates: UpdateInvoiceInput) => {
    queryClient.setQueryData(
      billingKeys.invoice(invoiceId),
      (oldData: any) => {
        if (oldData?.data) {
          return {
            ...oldData,
            data: {
              ...oldData.data,
              ...updates,
              updated_at: new Date().toISOString()
            }
          };
        }
        return oldData;
      }
    );
  };

  return { updateInvoiceOptimistically };
}