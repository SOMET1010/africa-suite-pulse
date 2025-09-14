import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Crown, ShieldCheck, Utensils } from 'lucide-react';

interface Employee {
  code: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
}

interface EmployeeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

// Données d'employés de test
const mockEmployees: Employee[] = [
  {
    code: 'MGR001',
    name: 'Sarah Dupont',
    role: 'manager',
    initials: 'SD'
  },
  {
    code: 'CSH001',
    name: 'Jean Martin',
    role: 'cashier',
    initials: 'JM'
  },
  {
    code: 'SRV001',
    name: 'Marie Leroy',
    role: 'server',
    initials: 'ML'
  },
  {
    code: 'SRV002',
    name: 'Pierre Dubois',
    role: 'server',
    initials: 'PD'
  },
  {
    code: 'HST001',
    name: 'Claire Moreau',
    role: 'hostess',
    initials: 'CM'
  }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'manager':
      return <Crown className="w-4 h-4" />;
    case 'cashier':
      return <ShieldCheck className="w-4 h-4" />;
    case 'server':
      return <Utensils className="w-4 h-4" />;
    case 'hostess':
      return <User className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'manager':
      return 'Manager';
    case 'cashier':
      return 'Caissier';
    case 'server':
      return 'Serveur';
    case 'hostess':
      return 'Hôtesse';
    default:
      return role;
  }
};

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'manager':
      return 'default' as const;
    case 'cashier':
      return 'secondary' as const;
    case 'server':
      return 'outline' as const;
    case 'hostess':
      return 'outline' as const;
    default:
      return 'outline' as const;
  }
};

export function EmployeeSelector({ value, onValueChange, disabled }: EmployeeSelectorProps) {
  const selectedEmployee = mockEmployees.find(emp => emp.code === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="h-12">
        <SelectValue placeholder="Sélectionnez un employé">
          {selectedEmployee && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {selectedEmployee.initials}
                </span>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedEmployee.name}</span>
                <Badge 
                  variant={getRoleVariant(selectedEmployee.role)} 
                  className="text-xs h-4 px-1"
                >
                  {getRoleIcon(selectedEmployee.role)}
                  <span className="ml-1">{getRoleLabel(selectedEmployee.role)}</span>
                </Badge>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-sm">
        {mockEmployees.map((employee) => (
          <SelectItem 
            key={employee.code} 
            value={employee.code}
            className="p-3 cursor-pointer"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {employee.initials}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-start">
                <span className="font-medium">{employee.name}</span>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={getRoleVariant(employee.role)} 
                    className="text-xs h-4 px-1"
                  >
                    {getRoleIcon(employee.role)}
                    <span className="ml-1">{getRoleLabel(employee.role)}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">{employee.code}</span>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}