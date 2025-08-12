import { useState, useEffect } from 'react';
import { HousekeepingTask, HousekeepingStaff, RoomStatus } from '../types';

// Mock data pour démonstration
const generateMockTasks = (): HousekeepingTask[] => [
  {
    id: '1',
    room_id: 'room-101',
    room_number: '101',
    task_type: 'cleaning',
    status: 'pending',
    priority: 'high',
    assigned_to: 'staff1',
    staff_name: 'Marie Dubois',
    estimated_duration: 45,
    checklist_items: [
      { id: '1', description: 'Nettoyer la salle de bain', completed: false, required: true, order: 1 },
      { id: '2', description: 'Changer les draps', completed: false, required: true, order: 2 },
      { id: '3', description: 'Aspirer le sol', completed: false, required: true, order: 3 }
    ],
    created_at: new Date().toISOString(),
    due_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Dans 4h
    org_id: 'org-1'
  },
  {
    id: '2',
    room_id: 'room-102',
    room_number: '102',
    task_type: 'maintenance',
    status: 'in_progress',
    priority: 'urgent',
    assigned_to: 'staff2',
    staff_name: 'Jean Martin',
    estimated_duration: 90,
    actual_duration: 45,
    checklist_items: [
      { id: '4', description: 'Réparer robinet', completed: true, required: true, order: 1 },
      { id: '5', description: 'Vérifier climatisation', completed: false, required: true, order: 2 }
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
    started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
    org_id: 'org-1'
  },
  {
    id: '3',
    room_id: 'room-103',
    room_number: '103',
    task_type: 'cleaning',
    status: 'completed',
    priority: 'medium',
    assigned_to: 'staff1',
    staff_name: 'Marie Dubois',
    estimated_duration: 30,
    actual_duration: 25,
    checklist_items: [
      { id: '6', description: 'Nettoyage standard', completed: true, required: true, order: 1 },
      { id: '7', description: 'Contrôle qualité', completed: true, required: true, order: 2 }
    ],
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // Il y a 6h
    started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Il y a 5h
    completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Il y a 4h
    org_id: 'org-1'
  },
  {
    id: '4',
    room_id: 'room-104',
    room_number: '104',
    task_type: 'inspection',
    status: 'pending',
    priority: 'low',
    assigned_to: 'staff3',
    staff_name: 'Sophie Laurent',
    estimated_duration: 15,
    checklist_items: [
      { id: '8', description: 'Inspection qualité', completed: false, required: true, order: 1 }
    ],
    created_at: new Date().toISOString(),
    org_id: 'org-1'
  }
];

const generateMockStaff = (): HousekeepingStaff[] => [
  {
    id: 'staff1',
    name: 'Marie Dubois',
    role: 'housekeeper',
    status: 'busy',
    current_task_id: '1',
    phone: '+225 07 12 34 56',
    shift_start: '08:00',
    shift_end: '16:00',
    org_id: 'org-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff2',
    name: 'Jean Martin',
    role: 'maintenance',
    status: 'busy',
    current_task_id: '2',
    phone: '+225 07 98 76 54',
    shift_start: '07:00',
    shift_end: '15:00',
    org_id: 'org-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff3',
    name: 'Sophie Laurent',
    role: 'supervisor',
    status: 'available',
    phone: '+225 07 11 22 33',
    shift_start: '09:00',
    shift_end: '17:00',
    org_id: 'org-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff4',
    name: 'Ibrahim Kone',
    role: 'housekeeper',
    status: 'break',
    phone: '+225 07 44 55 66',
    shift_start: '06:00',
    shift_end: '14:00',
    org_id: 'org-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const generateMockRooms = (): RoomStatus[] => [
  {
    room_id: 'room-101',
    room_number: '101',
    room_type: 'Standard',
    current_status: 'dirty',
    guest_status: 'checkout',
    priority_level: 3,
    needs_inspection: false,
    active_tasks: 1
  },
  {
    room_id: 'room-102',
    room_number: '102',
    room_type: 'Deluxe',
    current_status: 'maintenance',
    guest_status: 'vacant',
    priority_level: 4,
    needs_inspection: false,
    active_tasks: 1
  },
  {
    room_id: 'room-103',
    room_number: '103',
    room_type: 'Standard',
    current_status: 'clean',
    guest_status: 'vacant',
    last_cleaned: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Il y a 4h
    priority_level: 1,
    needs_inspection: false,
    active_tasks: 0
  },
  {
    room_id: 'room-104',
    room_number: '104',
    room_type: 'Suite',
    current_status: 'clean',
    guest_status: 'vacant',
    last_cleaned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
    priority_level: 1,
    needs_inspection: true,
    active_tasks: 1
  },
  {
    room_id: 'room-105',
    room_number: '105',
    room_type: 'Standard',
    current_status: 'dirty',
    guest_status: 'checkout',
    priority_level: 3,
    needs_inspection: false,
    active_tasks: 0
  },
  {
    room_id: 'room-106',
    room_number: '106',
    room_type: 'Deluxe',
    current_status: 'clean',
    guest_status: 'occupied',
    last_cleaned: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Il y a 24h
    priority_level: 2,
    needs_inspection: false,
    active_tasks: 0
  }
];

// Hooks pour les données mock
export function useMockHousekeepingTasks() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler une petite latence
    setTimeout(() => {
      setTasks(generateMockTasks());
      setLoading(false);
    }, 500);
  }, []);

  const updateTaskStatus = (taskId: string, status: HousekeepingTask['status'], notes?: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updates: Partial<HousekeepingTask> = { status };
          
          if (status === 'in_progress') {
            updates.started_at = new Date().toISOString();
          } else if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
            updates.actual_duration = task.estimated_duration + Math.floor(Math.random() * 20 - 10); // ±10 min variation
          }
          
          if (notes) {
            updates.notes = notes;
          }

          return { ...task, ...updates };
        }
        return task;
      })
    );
  };

  const assignTask = (taskId: string, staffId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, assigned_to: staffId }
          : task
      )
    );
  };

  return {
    tasks,
    loading,
    updateTaskStatus,
    assignTask
  };
}

export function useMockHousekeepingStaff() {
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStaff(generateMockStaff());
      setLoading(false);
    }, 300);
  }, []);

  const updateStaffStatus = (staffId: string, status: HousekeepingStaff['status']) => {
    setStaff(prevStaff => 
      prevStaff.map(member => 
        member.id === staffId 
          ? { ...member, status, updated_at: new Date().toISOString() }
          : member
      )
    );
  };

  return {
    staff,
    loading,
    updateStaffStatus
  };
}

export function useMockRoomStatuses() {
  const [rooms, setRooms] = useState<RoomStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRooms(generateMockRooms());
      setLoading(false);
    }, 400);
  }, []);

  const updateRoomStatus = (roomId: string, status: RoomStatus['current_status']) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.room_id === roomId 
          ? { 
              ...room, 
              current_status: status,
              last_cleaned: status === 'clean' ? new Date().toISOString() : room.last_cleaned,
              needs_inspection: status === 'clean'
            }
          : room
      )
    );
  };

  return {
    rooms,
    loading,
    updateRoomStatus
  };
}