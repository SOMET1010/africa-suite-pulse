import { useState, useEffect } from 'react';
import { RecoucheWorkflow } from '../types';

const generateMockWorkflows = (): RecoucheWorkflow[] => [
  {
    room_id: 'room-101',
    reservation_id: 'res-101',
    checkout_completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'checkout_dirty',
    priority: 'express',
    estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    expected_checkin_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    notes: 'Client VIP - check-in anticipé demandé'
  },
  {
    room_id: 'room-102',
    reservation_id: 'res-102',
    checkout_completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    cleaning_started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'cleaning_in_progress',
    priority: 'normal',
    assigned_cleaner: 'staff2',
    estimated_completion: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    expected_checkin_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  },
  {
    room_id: 'room-103',
    reservation_id: 'res-103',
    checkout_completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    cleaning_started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cleaning_completed_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'inspection_pending',
    priority: 'vip',
    assigned_cleaner: 'staff1',
    estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    expected_checkin_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    notes: 'Suite VIP - inspection qualité renforcée'
  },
  {
    room_id: 'room-104',
    reservation_id: 'res-104',
    checkout_completed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    cleaning_started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    cleaning_completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    inspection_completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ready_for_checkin_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'ready_for_checkin',
    priority: 'normal',
    assigned_cleaner: 'staff1',
    assigned_inspector: 'staff3',
    estimated_completion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    expected_checkin_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
  },
  {
    room_id: 'room-105',
    checkout_completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'cleaning_assigned',
    priority: 'normal',
    assigned_cleaner: 'staff2',
    estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    expected_checkin_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  }
];

export function useRecoucheWorkflow() {
  const [workflows, setWorkflows] = useState<RecoucheWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setWorkflows(generateMockWorkflows());
      setLoading(false);
    }, 600);
  }, []);

  const startTask = (roomId: string, taskType: 'cleaning' | 'inspection') => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow => {
        if (workflow.room_id === roomId) {
          const now = new Date().toISOString();
          
          if (taskType === 'cleaning') {
            if (workflow.status === 'checkout_dirty') {
              return {
                ...workflow,
                status: 'cleaning_assigned',
                cleaning_started_at: now
              };
            } else if (workflow.status === 'cleaning_assigned') {
              return {
                ...workflow,
                status: 'cleaning_in_progress',
                cleaning_started_at: now
              };
            }
          } else if (taskType === 'inspection') {
            if (workflow.status === 'cleaning_completed') {
              return {
                ...workflow,
                status: 'inspection_pending'
              };
            }
          }
        }
        return workflow;
      })
    );
  };

  const completeTask = (roomId: string, taskType: 'cleaning' | 'inspection') => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow => {
        if (workflow.room_id === roomId) {
          const now = new Date().toISOString();
          
          if (taskType === 'cleaning' && workflow.status === 'cleaning_in_progress') {
            return {
              ...workflow,
              status: 'cleaning_completed',
              cleaning_completed_at: now
            };
          } else if (taskType === 'inspection' && workflow.status === 'inspection_pending') {
            return {
              ...workflow,
              status: 'ready_for_checkin',
              inspection_completed_at: now,
              ready_for_checkin_at: now
            };
          }
        }
        return workflow;
      })
    );
  };

  const assignStaff = (roomId: string, staffId: string, role: 'cleaner' | 'inspector') => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow => {
        if (workflow.room_id === roomId) {
          if (role === 'cleaner') {
            return { ...workflow, assigned_cleaner: staffId };
          } else {
            return { ...workflow, assigned_inspector: staffId };
          }
        }
        return workflow;
      })
    );
  };

  const updateWorkflowPriority = (roomId: string, priority: RecoucheWorkflow['priority']) => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow =>
        workflow.room_id === roomId
          ? { ...workflow, priority }
          : workflow
      )
    );
  };

  return {
    workflows,
    loading,
    startTask,
    completeTask,
    assignStaff,
    updateWorkflowPriority
  };
}