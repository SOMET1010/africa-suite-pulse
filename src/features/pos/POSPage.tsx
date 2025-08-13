import { GlobalNavigationLayout } from "@/core/layout/GlobalNavigationLayout";
import { POSMainMenu } from "./components/POSMainMenu";

export default function POSPage() {
  return (
    <GlobalNavigationLayout title="Point de Vente">
      <POSMainMenu />
    </GlobalNavigationLayout>
  );
}