import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { POSMainMenu } from "./components/POSMainMenu";

export default function POSPage() {
  return (
    <MainAppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Point de Vente</h1>
            <p className="text-muted-foreground">
              Système de caisse et gestion des commandes
            </p>
          </div>
        </div>
        <POSMainMenu />
      </div>
    </MainAppLayout>
  );
}