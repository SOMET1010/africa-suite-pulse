import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { queryClient } from "@/lib/queryClient";
import { setupRealtimeListeners, cleanupRealtimeListeners } from "@/lib/realtime";

const App = () => {
  // Configuration du temps réel pour synchronisation automatique
  useEffect(() => {
    console.log("🚀 AfricaSuite PMS - Initializing with React Query + Realtime");
    
    const channels = setupRealtimeListeners();
    
    return () => {
      cleanupRealtimeListeners(channels);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
