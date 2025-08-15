import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

export function OperationsMetrics() {
  // Mock data - will be replaced with real data
  const taskCompletionData = [
    { name: 'Lun', maintenance: 4, housekeeping: 12, inventory: 3 },
    { name: 'Mar', maintenance: 3, housekeeping: 15, inventory: 5 },
    { name: 'Mer', maintenance: 6, housekeeping: 10, inventory: 2 },
    { name: 'Jeu', maintenance: 2, housekeeping: 18, inventory: 4 },
    { name: 'Ven', maintenance: 5, housekeeping: 14, inventory: 6 },
    { name: 'Sam', maintenance: 1, housekeeping: 8, inventory: 1 },
    { name: 'Dim', maintenance: 2, housekeeping: 6, inventory: 2 }
  ];

  const statusDistribution = [
    { name: 'Terminé', value: 65, color: '#22c55e' },
    { name: 'En cours', value: 20, color: '#f59e0b' },
    { name: 'En attente', value: 10, color: '#6b7280' },
    { name: 'En retard', value: 5, color: '#ef4444' }
  ];

  const efficiencyTrend = [
    { time: '06:00', efficiency: 45 },
    { time: '08:00', efficiency: 65 },
    { time: '10:00', efficiency: 78 },
    { time: '12:00', efficiency: 85 },
    { time: '14:00', efficiency: 82 },
    { time: '16:00', efficiency: 75 },
    { time: '18:00', efficiency: 68 },
    { time: '20:00', efficiency: 55 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Completion by Module */}
      <Card>
        <CardHeader>
          <CardTitle>Tâches Complétées par Module (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="Maintenance" />
              <Bar dataKey="housekeeping" stackId="a" fill="#3b82f6" name="Ménage" />
              <Bar dataKey="inventory" stackId="a" fill="#22c55e" name="Inventaire" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des Statuts</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tendance d'Efficacité (Aujourd'hui)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={efficiencyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Efficacité']} />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}