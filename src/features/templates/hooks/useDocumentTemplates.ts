
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { 
  DocumentTemplate, 
  DocumentTemplateInsert, 
  TemplateType 
} from '@/types/templates';

// Mock data for now - will be replaced with real Supabase calls once the table exists
const mockTemplates: DocumentTemplate[] = [];

export function useDocumentTemplates(type?: TemplateType) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>(
    type ? mockTemplates.filter(t => t.type === type) : mockTemplates
  );
  const [isLoading, setIsLoading] = useState(false);

  const createTemplate = async (template: DocumentTemplateInsert) => {
    try {
      setIsLoading(true);
      const newTemplate: DocumentTemplate = {
        ...template,
        id: `temp_${Date.now()}`,
        org_id: 'temp',
        is_active: true,
        is_default: template.is_default || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setTemplates(prev => [...prev, newTemplate]);
      
      toast({
        title: 'Template créé',
        description: 'Le template de document a été créé avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le template: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => {
    try {
      setIsLoading(true);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
      
      toast({
        title: 'Template modifié',
        description: 'Le template de document a été modifié avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de modifier le template: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Template supprimé',
        description: 'Le template de document a été supprimé avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le template: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultTemplate = async ({ id, type }: { id: string; type: TemplateType }) => {
    try {
      setIsLoading(true);
      setTemplates(prev => prev.map(t => ({ 
        ...t, 
        is_default: t.type === type ? t.id === id : t.is_default 
      })));
      
      toast({
        title: 'Template par défaut défini',
        description: 'Ce template est maintenant le template par défaut.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de définir le template par défaut: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    isCreating: isLoading,
    isUpdating: isLoading,
    isDeleting: isLoading,
  };
}

export function useTemplateById(id: string) {
  return {
    data: mockTemplates.find(t => t.id === id),
    isLoading: false,
    error: null,
  };
}

export function useDefaultTemplate(type: TemplateType) {
  return {
    data: mockTemplates.find(t => t.type === type && t.is_default),
    isLoading: false,
    error: null,
  };
}
