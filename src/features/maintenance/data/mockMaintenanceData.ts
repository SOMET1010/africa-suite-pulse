/**
 * Mock data for maintenance module
 * Used for development and testing until real data is integrated
 */

export const mockEquipmentData = [
  {
    id: "eq-001",
    equipment_code: "CLIM-001",
    name: "Climatiseur Central Hall",
    category: "HVAC",
    location: "Hall d'accueil",
    brand: "Daikin",
    model: "VRV-IV",
    serial_number: "DK2024-HC001",
    purchase_date: "2024-01-15",
    warranty_until: "2027-01-15",
    installation_date: "2024-01-20",
    status: "operational",
    maintenance_frequency_days: 90,
    last_maintenance_date: "2024-10-15",
    next_maintenance_date: "2025-01-15",
    specifications: {
      power: "15kW",
      capacity: "50m²",
      refrigerant: "R32"
    },
    notes: "Système principal pour la climatisation du hall",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-15T14:30:00Z",
    org_id: "org-001"
  },
  {
    id: "eq-002",
    equipment_code: "ELEV-001",
    name: "Ascenseur Principal",
    category: "Transport vertical",
    location: "Bâtiment principal",
    brand: "Otis",
    model: "Gen2",
    serial_number: "OT2024-ASC001",
    purchase_date: "2023-06-10",
    warranty_until: "2028-06-10",
    installation_date: "2023-07-01",
    status: "operational",
    maintenance_frequency_days: 30,
    last_maintenance_date: "2024-11-01",
    next_maintenance_date: "2024-12-01",
    specifications: {
      capacity: "1000kg",
      speed: "1.5m/s",
      floors: "5 étages"
    },
    notes: "Maintenance mensuelle obligatoire",
    created_at: "2023-06-10T09:00:00Z",
    updated_at: "2024-11-01T16:00:00Z",
    org_id: "org-001"
  },
  {
    id: "eq-003",
    equipment_code: "GEN-001",
    name: "Groupe Électrogène de Secours",
    category: "Électricité",
    location: "Local technique",
    brand: "Caterpillar",
    model: "C15",
    serial_number: "CAT2023-GEN001",
    purchase_date: "2023-03-20",
    warranty_until: "2026-03-20",
    installation_date: "2023-04-05",
    status: "standby",
    maintenance_frequency_days: 180,
    last_maintenance_date: "2024-08-15",
    next_maintenance_date: "2025-02-15",
    specifications: {
      power: "500kVA",
      fuel: "Gasoil",
      autonomy: "24h"
    },
    notes: "Test mensuel obligatoire",
    created_at: "2023-03-20T11:00:00Z",
    updated_at: "2024-08-15T10:30:00Z",
    org_id: "org-001"
  }
];

export const mockMaintenanceRequests = [
  {
    id: "req-001",
    request_number: "MAINT-000001",
    title: "Fuite climatiseur chambre 205",
    description: "Fuite d'eau constatée sous l'unité intérieure de la chambre 205. L'eau s'accumule sur le sol.",
    category: "HVAC",
    priority: "high",
    status: "pending",
    location: "Chambre 205",
    equipment_id: null,
    reported_by: "Marie Dupont",
    assigned_to: null,
    estimated_cost: 25000,
    estimated_duration_hours: 2,
    scheduled_date: null,
    started_at: null,
    completed_at: null,
    notes: "Client signale depuis ce matin",
    created_at: "2024-12-13T08:30:00Z",
    updated_at: "2024-12-13T08:30:00Z",
    created_by: "user-001",
    org_id: "org-001"
  },
  {
    id: "req-002",
    request_number: "MAINT-000002",
    title: "Maintenance préventive ascenseur",
    description: "Maintenance préventive mensuelle de l'ascenseur principal selon le planning.",
    category: "Transport vertical",
    priority: "medium",
    status: "scheduled",
    location: "Bâtiment principal",
    equipment_id: "eq-002",
    reported_by: "Système automatique",
    assigned_to: "Jean Martin",
    estimated_cost: 45000,
    estimated_duration_hours: 4,
    scheduled_date: "2024-12-15T09:00:00Z",
    started_at: null,
    completed_at: null,
    notes: "Maintenance programmée",
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-10T14:00:00Z",
    created_by: "system",
    org_id: "org-001"
  },
  {
    id: "req-003",
    request_number: "MAINT-000003",
    title: "Remplacement ampoules couloir étage 3",
    description: "Plusieurs ampoules LED grillées dans le couloir du 3ème étage. Remplacer par des LED 9W équivalent 60W.",
    category: "Électricité",
    priority: "low",
    status: "in_progress",
    location: "Couloir étage 3",
    equipment_id: null,
    reported_by: "Paul Durand",
    assigned_to: "Pierre Moreau",
    estimated_cost: 5000,
    estimated_duration_hours: 1,
    scheduled_date: "2024-12-13T14:00:00Z",
    started_at: "2024-12-13T14:15:00Z",
    completed_at: null,
    notes: "5 ampoules à remplacer",
    created_at: "2024-12-12T16:45:00Z",
    updated_at: "2024-12-13T14:15:00Z",
    created_by: "user-003",
    org_id: "org-001"
  }
];

export const mockSparePartsData = [
  {
    id: "part-001",
    part_code: "CLIM-FILT-001",
    name: "Filtre climatiseur standard",
    description: "Filtre à air pour unités intérieures climatisation",
    category: "HVAC",
    current_stock: 12,
    minimum_stock: 5,
    unit_price: 2500,
    supplier: "Daikin Côte d'Ivoire",
    location: "Magasin A1",
    last_restocked_date: "2024-11-01",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-11-01T09:30:00Z",
    org_id: "org-001"
  },
  {
    id: "part-002",
    part_code: "ELEV-CABLE-001",
    name: "Câble ascenseur acier",
    description: "Câble en acier pour ascenseur, diamètre 8mm",
    category: "Transport vertical",
    current_stock: 2,
    minimum_stock: 3,
    unit_price: 125000,
    supplier: "Otis Services",
    location: "Magasin B2",
    last_restocked_date: "2024-09-15",
    created_at: "2023-06-10T09:00:00Z",
    updated_at: "2024-09-15T11:00:00Z",
    org_id: "org-001"
  },
  {
    id: "part-003",
    part_code: "ELEC-LED-001",
    name: "Ampoule LED 9W E27",
    description: "Ampoule LED blanc chaud, équivalent 60W",
    category: "Électricité",
    current_stock: 25,
    minimum_stock: 10,
    unit_price: 1200,
    supplier: "Philips CI",
    location: "Magasin A2",
    last_restocked_date: "2024-12-01",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-12-01T15:30:00Z",
    org_id: "org-001"
  },
  {
    id: "part-004",
    part_code: "GEN-FILT-001",
    name: "Filtre à huile générateur",
    description: "Filtre à huile moteur pour groupe électrogène Caterpillar",
    category: "Électricité",
    current_stock: 1,
    minimum_stock: 2,
    unit_price: 15000,
    supplier: "Caterpillar CI",
    location: "Magasin B1",
    last_restocked_date: "2024-08-15",
    created_at: "2023-03-20T11:00:00Z",
    updated_at: "2024-08-15T10:30:00Z",
    org_id: "org-001"
  }
];

export const mockMaintenanceSchedules = [
  {
    id: "sched-001",
    schedule_name: "Maintenance ascenseur mensuelle",
    equipment_id: "eq-002",
    task_template: "Vérification complète sécurité, test freins, graissage, contrôle câbles",
    frequency_type: "monthly",
    frequency_value: 1,
    next_execution_date: "2024-12-15",
    last_executed_date: "2024-11-15",
    estimated_duration_hours: 4,
    assigned_technician: "Jean Martin",
    required_parts: [
      { part_id: "part-002", quantity: 1, description: "Inspection câbles" }
    ],
    is_active: true,
    created_at: "2023-07-01T09:00:00Z",
    updated_at: "2024-11-15T16:00:00Z",
    created_by: "user-002",
    org_id: "org-001"
  },
  {
    id: "sched-002",
    schedule_name: "Maintenance climatisation trimestrielle",
    equipment_id: "eq-001",
    task_template: "Nettoyage filtres, vérification pression, contrôle condenseur",
    frequency_type: "quarterly",
    frequency_value: 3,
    next_execution_date: "2025-01-15",
    last_executed_date: "2024-10-15",
    estimated_duration_hours: 3,
    assigned_technician: "Pierre Moreau",
    required_parts: [
      { part_id: "part-001", quantity: 2, description: "Remplacement filtres" }
    ],
    is_active: true,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-10-15T14:30:00Z",
    created_by: "user-002",
    org_id: "org-001"
  },
  {
    id: "sched-003",
    schedule_name: "Test générateur mensuel",
    equipment_id: "eq-003",
    task_template: "Test démarrage, vérification niveau huile/carburant, test charge",
    frequency_type: "monthly",
    frequency_value: 1,
    next_execution_date: "2024-12-20",
    last_executed_date: "2024-11-20",
    estimated_duration_hours: 1,
    assigned_technician: "Jean Martin",
    required_parts: [],
    is_active: true,
    created_at: "2023-04-05T11:00:00Z",
    updated_at: "2024-11-20T09:30:00Z",
    created_by: "user-002",
    org_id: "org-001"
  }
];

/**
 * Helper functions for working with mock data
 */
export const getEquipmentById = (id: string) => 
  mockEquipmentData.find(eq => eq.id === id);

export const getRequestsByStatus = (status: string) =>
  mockMaintenanceRequests.filter(req => req.status === status);

export const getLowStockParts = () =>
  mockSparePartsData.filter(part => part.current_stock <= part.minimum_stock);

export const getUpcomingSchedules = (days: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return mockMaintenanceSchedules.filter(schedule => {
    const nextDate = new Date(schedule.next_execution_date);
    return nextDate <= futureDate && schedule.is_active;
  });
};