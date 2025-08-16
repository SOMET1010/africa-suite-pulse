import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { createInvoice } from "../api/billing.api";
import { billingKeys } from "./useBilling";
import type { CreateInvoiceInput } from "../types/billing.types";

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      const response = await createInvoice(input);
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (invoice) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices(orgId || '') });
      queryClient.invalidateQueries({ queryKey: billingKeys.stats(orgId || '') });
      
      toast({
        title: "Facture créée",
        description: `Facture ${invoice.number} créée avec succès`,
      });
    },
    onError: (error: any) => {
      logger.error('Create invoice error', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
    },
  });
}