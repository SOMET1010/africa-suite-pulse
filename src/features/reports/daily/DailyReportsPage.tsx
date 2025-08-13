import { useState } from "react";
import { PageLayout } from "@/core/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, UserCheck, UserX, Building, FileText, Download } from "lucide-react";
import { EnhancedArrivalsReport } from "./components/EnhancedArrivalsReport";
import { EnhancedDeparturesReport } from "./components/EnhancedDeparturesReport";
import { InHouseReport } from "./components/InHouseReport";
import { EnhancedNoShowReport } from "./components/EnhancedNoShowReport";
import { OccupancyReport } from "./components/OccupancyReport";

export default function DailyReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const breadcrumbs = [
    { label: "Rapports", href: "/reports" },
    { label: "Rapports quotidiens" }
  ];

  return (
    <PageLayout
      title="Rapports Quotidiens"
      description="Rapports opérationnels journaliers pour le front office"
      breadcrumbs={breadcrumbs}
      className="space-y-6"
    >
      {/* Date Selection Header */}
      <div className="glass-card p-6 border-accent-gold/20 shadow-luxury">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-luxury">Date sélectionnée</h2>
              <p className="text-muted-foreground">Rapports pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-elegant"
            />
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter tout
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="arrivals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/5 border-accent-gold/20">
          <TabsTrigger value="arrivals" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Arrivées
          </TabsTrigger>
          <TabsTrigger value="departures" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Départs
          </TabsTrigger>
          <TabsTrigger value="inhouse" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Présents
          </TabsTrigger>
          <TabsTrigger value="noshow" className="flex items-center gap-2">
            <UserX className="h-4 w-4" />
            No-Show
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Occupation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arrivals" className="space-y-6">
          <EnhancedArrivalsReport selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="departures" className="space-y-6">
          <EnhancedDeparturesReport selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="inhouse" className="space-y-6">
          <InHouseReport selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="noshow" className="space-y-6">
          <EnhancedNoShowReport selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <OccupancyReport selectedDate={selectedDate} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}