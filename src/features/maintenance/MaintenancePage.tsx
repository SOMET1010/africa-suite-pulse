import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Package, Calendar } from "lucide-react";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { MaintenanceRequestsList } from "./components/MaintenanceRequestsList";
import { EquipmentList } from "./components/EquipmentList";
import { SparePartsList } from "./components/SparePartsList";
import { MaintenanceSchedules } from "./components/MaintenanceSchedules";
import { MaintenanceKPIs } from "./components/MaintenanceKPIs";
import { CreateMaintenanceRequestDialog } from "./components/CreateMaintenanceRequestDialog";
import { CreateEquipmentDialog } from "./components/CreateEquipmentDialog";
import { CreateSparePartDialog } from "./components/CreateSparePartDialog";

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreateEquipment, setShowCreateEquipment] = useState(false);
  const [showCreateSparePart, setShowCreateSparePart] = useState(false);

  const getCreateButton = () => {
    switch (activeTab) {
      case "requests":
        return (
          <Button onClick={() => setShowCreateRequest(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </Button>
        );
      case "equipment":
        return (
          <Button onClick={() => setShowCreateEquipment(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel équipement
          </Button>
        );
      case "parts":
        return (
          <Button onClick={() => setShowCreateSparePart(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle pièce
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance & Technique</h1>
            <p className="text-muted-foreground">
              Gestion des équipements, interventions et pièces détachées
            </p>
          </div>
          {getCreateButton()}
        </div>

        {/* KPIs */}
        <MaintenanceKPIs />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests" className="gap-2">
              <Wrench className="w-4 h-4" />
              Demandes
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Package className="w-4 h-4" />
              Équipements
            </TabsTrigger>
            <TabsTrigger value="parts" className="gap-2">
              <Package className="w-4 h-4" />
              Pièces détachées
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2">
              <Calendar className="w-4 h-4" />
              Planifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <MaintenanceRequestsList />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentList />
          </TabsContent>

          <TabsContent value="parts" className="space-y-6">
            <SparePartsList />
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <MaintenanceSchedules />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateMaintenanceRequestDialog
          open={showCreateRequest}
          onOpenChange={setShowCreateRequest}
        />
        <CreateEquipmentDialog
          open={showCreateEquipment}
          onOpenChange={setShowCreateEquipment}
        />
        <CreateSparePartDialog
          open={showCreateSparePart}
          onOpenChange={setShowCreateSparePart}
        />
      </div>
    </MainAppLayout>
  );
}