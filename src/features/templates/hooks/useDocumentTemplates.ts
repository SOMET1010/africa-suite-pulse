import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  DocumentTemplate, 
  DocumentTemplateInsert, 
  TemplateType 
} from '@/types/templates';

export function useDocumentTemplates(type?: TemplateType) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = type ? ['document-templates', type] : ['document-templates'];

  const { data: templates = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: DocumentTemplateInsert) => {
      const { data, error } = await supabase
        .from('document_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template créé',
        description: 'Le template de document a été créé avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => {
      const { data, error } = await supabase
        .from('document_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template modifié',
        description: 'Le template de document a été modifié avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de modifier le template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template supprimé',
        description: 'Le template de document a été supprimé avec succès.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const setDefaultTemplateMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: TemplateType }) => {
      // Retirer le défaut de tous les templates du même type
      await supabase
        .from('document_templates')
        .update({ is_default: false })
        .eq('type', type);

      // Définir le nouveau template par défaut
      const { data, error } = await supabase
        .from('document_templates')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template par défaut défini',
        description: 'Ce template est maintenant le template par défaut.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de définir le template par défaut: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    setDefaultTemplate: setDefaultTemplateMutation.mutate,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
}

export function useTemplateById(id: string) {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    enabled: !!id,
  });
}

export function useDefaultTemplate(type: TemplateType) {
  return useQuery({
    queryKey: ['default-template', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('type', type)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
  });
}