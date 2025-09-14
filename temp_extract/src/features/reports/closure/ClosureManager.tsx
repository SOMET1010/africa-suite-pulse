import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, FileCheck, DollarSign, Download, Settings } from "lucide-react";
import { PreClosureReport } from "./PreClosureReport";
import { POSZReport } from "./POSZReport";
import { MainCoranteReport } from "./MainCoranteReport";
import { SyscohadaExport } from "./SyscohadaExport";
import type { ReportPeriod } from "@/types/reports";

export function ClosureManager() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      start_date: firstDay.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      period_type: 'month',
      label: `${today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    };
  });

  const [canClose, setCanClose] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports de Clôture</h1>
          <p className="text-muted-foreground">
            Contrôles, rapports Z POS, main courante et exports comptables
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <Label htmlFor="closure_date" className="text-sm">Date de clôture</Label>
            <Input
              id="closure_date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="preclosure" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preclosure" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Pré-clôture
          </TabsTrigger>
          <TabsTrigger value="pos-z" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rapports Z
          </TabsTrigger>
          <TabsTrigger value="main-courante" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Main Courante
          </TabsTrigger>
          <TabsTrigger value="syscohada" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            SYSCOHADA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preclosure" className="space-y-6">
          <PreClosureReport 
            selectedDate={selectedDate}
            onCanClose={setCanClose}
          />
        </TabsContent>

        <TabsContent value="pos-z" className="space-y-6">
          <POSZReport selectedDate={selectedDate} />
        </TabsContent>

        <TabsContent value="main-courante" className="space-y-6">
          <MainCoranteReport 
            period={reportPeriod}
            onPeriodChange={setReportPeriod}
          />
        </TabsContent>

        <TabsContent value="syscohada" className="space-y-6">
          <SyscohadaExport 
            period={reportPeriod}
            onPeriodChange={setReportPeriod}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}