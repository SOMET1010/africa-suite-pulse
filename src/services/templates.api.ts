import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DocumentTemplate {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  content: string;
  variables: string[];
  styles: Record<string, any>;
  version: number;
  is_active: boolean;
  is_default: boolean;
  preview_data: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  code: string;
  name: string;
  description?: string;
  type: 'invoice' | 'confirmation' | 'contract' | 'email';
  category?: string;
  content: string;
  variables?: string[];
  styles?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  preview_data?: Record<string, any>;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  content?: string;
  variables?: string[];
  styles?: Record<string, any>;
  is_active?: boolean;
  is_default?: boolean;
  preview_data?: Record<string, any>;
}

class DocumentTemplatesService {
  // Get all templates
  async getTemplates(): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(template => ({
      ...template,
      variables: template.variables as string[],
      styles: template.styles as Record<string, any>,
      preview_data: template.preview_data as Record<string, any>
    }));
  }

  // Get templates by type
  async getTemplatesByType(type: string): Promise<DocumentTemplate[]> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return (data || []).map(template => ({
      ...template,
      variables: template.variables as string[],
      styles: template.styles as Record<string, any>,
      preview_data: template.preview_data as Record<string, any>
    }));
  }

  // Get template by ID
  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data ? {
      ...data,
      variables: data.variables as string[],
      styles: data.styles as Record<string, any>,
      preview_data: data.preview_data as Record<string, any>
    } : null;
  }

  // Create template
  async createTemplate(templateData: CreateTemplateData): Promise<DocumentTemplate> {
    // Get current user's org_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: appUser } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!appUser?.org_id) throw new Error('Organization not found');

    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        org_id: appUser.org_id,
        code: templateData.code,
        name: templateData.name,
        description: templateData.description,
        type: templateData.type,
        category: templateData.category,
        content: templateData.content,
        variables: templateData.variables || [],
        styles: templateData.styles || {},
        is_active: templateData.is_active ?? true,
        is_default: templateData.is_default ?? false,
        preview_data: templateData.preview_data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      variables: data.variables as string[],
      styles: data.styles as Record<string, any>,
      preview_data: data.preview_data as Record<string, any>
    };
  }

  // Update template
  async updateTemplate(id: string, updates: UpdateTemplateData): Promise<DocumentTemplate> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      variables: data.variables as string[],
      styles: data.styles as Record<string, any>,
      preview_data: data.preview_data as Record<string, any>
    };
  }

  // Delete template
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Clone template (create new version)
  async cloneTemplate(id: string, newName: string): Promise<DocumentTemplate> {
    const original = await this.getTemplate(id);
    if (!original) throw new Error('Template not found');

    const cloneData: CreateTemplateData = {
      code: `${original.code}_copy`,
      name: newName,
      description: `Copie de ${original.name}`,
      type: original.type as 'invoice' | 'confirmation' | 'contract' | 'email',
      category: original.category,
      content: original.content,
      variables: original.variables,
      styles: original.styles,
      preview_data: original.preview_data,
      is_active: true,
      is_default: false,
    };

    return this.createTemplate(cloneData);
  }

  // Render template with data
  renderTemplate(template: DocumentTemplate, data: Record<string, any>): string {
    let content = template.content;
    
    // Simple variable replacement
    template.variables.forEach(variable => {
      const value = this.getNestedValue(data, variable);
      const regex = new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, 'g');
      content = content.replace(regex, value?.toString() || '');
    });

    return content;
  }

  // Helper to get nested object value (e.g., "guest.name")
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const templatesService = new DocumentTemplatesService();

// React Query hooks
export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesService.getTemplates(),
  });
};

export const useTemplatesByType = (type: string) => {
  return useQuery({
    queryKey: ['templates', 'by-type', type],
    queryFn: () => templatesService.getTemplatesByType(type),
    enabled: !!type,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesService.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTemplateData) => 
      templatesService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateData }) => 
      templatesService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useCloneTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      templatesService.cloneTemplate(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};