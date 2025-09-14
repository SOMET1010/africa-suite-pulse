import { supabase } from '@/integrations/supabase/client';
import { ApiHelpers, throwIfError } from './api.core';

// Types
export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  trigger_type: 'manual' | 'schedule' | 'event';
  trigger_config: Record<string, any>;
  workflow_definition: Record<string, any>;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  org_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  execution_logs: Array<Record<string, any>>;
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  trigger_type: 'manual' | 'schedule' | 'event';
  trigger_config: Record<string, any>;
  workflow_definition: Record<string, any>;
}

export class WorkflowsAPI {
  // Get all workflows for org
  async getWorkflows(): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(workflow => ({
      ...workflow,
      trigger_type: workflow.trigger_type as 'manual' | 'schedule' | 'event',
      trigger_config: workflow.trigger_config as Record<string, any>,
      workflow_definition: workflow.workflow_definition as Record<string, any>
    }));
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data ? {
      ...data,
      trigger_type: data.trigger_type as 'manual' | 'schedule' | 'event',
      trigger_config: data.trigger_config as Record<string, any>,
      workflow_definition: data.workflow_definition as Record<string, any>
    } : null;
  }

  // Create workflow
  async createWorkflow(workflowData: CreateWorkflowData): Promise<Workflow> {
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
      .from('workflows')
      .insert({
        org_id: appUser.org_id,
        name: workflowData.name,
        description: workflowData.description,
        trigger_type: workflowData.trigger_type,
        trigger_config: workflowData.trigger_config,
        workflow_definition: workflowData.workflow_definition,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      trigger_type: data.trigger_type as 'manual' | 'schedule' | 'event',
      trigger_config: data.trigger_config as Record<string, any>,
      workflow_definition: data.workflow_definition as Record<string, any>
    };
  }

  // Update workflow
  async updateWorkflow(id: string, updates: Partial<CreateWorkflowData>): Promise<Workflow> {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      trigger_type: data.trigger_type as 'manual' | 'schedule' | 'event',
      trigger_config: data.trigger_config as Record<string, any>,
      workflow_definition: data.workflow_definition as Record<string, any>
    };
  }

  // Delete workflow
  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Execute workflow
  async executeWorkflow(id: string, inputData: Record<string, any> = {}): Promise<WorkflowExecution> {
    const { data, error } = await supabase.functions.invoke('execute-workflow', {
      body: {
        workflow_id: id,
        input_data: inputData
      }
    });

    if (error) throw error;
    return data;
  }

  // Get workflow executions
  async getWorkflowExecutions(workflowId?: string, limit = 50): Promise<WorkflowExecution[]> {
    let query = supabase
      .from('workflow_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (workflowId) {
      query = query.eq('workflow_id', workflowId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(execution => ({
      ...execution,
      status: execution.status as 'running' | 'completed' | 'failed' | 'cancelled',
      input_data: execution.input_data as Record<string, any>,
      output_data: execution.output_data as Record<string, any>,
      execution_logs: execution.execution_logs as Array<Record<string, any>>
    }));
  }

  // Get execution by ID
  async getExecution(id: string): Promise<WorkflowExecution | null> {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data ? {
      ...data,
      status: data.status as 'running' | 'completed' | 'failed' | 'cancelled',
      input_data: data.input_data as Record<string, any>,
      output_data: data.output_data as Record<string, any>,
      execution_logs: data.execution_logs as Array<Record<string, any>>
    } : null;
  }

  // Cancel workflow execution
  async cancelExecution(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  }
}

export const workflowsAPI = new WorkflowsAPI();