import { Routes, Route } from "react-router-dom";
import POSTerminalPage from "./pages/POSTerminalPage";
import POSKitchenPage from "./pages/POSKitchenPage";
import POSInventoryPage from "./pages/POSInventoryPage";

export function POSRoutes() {
  return (
    <Routes>
      <Route path="/terminal" element={<POSTerminalPage />} />
      <Route path="/kitchen" element={<POSKitchenPage />} />
      <Route path="/inventory" element={<POSInventoryPage />} />
    </Routes>
  );
}