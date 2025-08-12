
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { queryClient } from "@/lib/queryClient";

const App = () => {
  // Configuration du temps réel pour synchronisation automatique
  useEffect(() => {
    let channels: any[] = [];
    
    // Safely import and setup realtime listeners
    const setupRealtime = async () => {
      try {
        const { setupRealtimeListeners, cleanupRealtimeListeners } = await import("@/lib/realtime");
        channels = setupRealtimeListeners() || [];
      } catch (error) {
        console.warn("Realtime setup failed:", error);
      }
    };
    
    setupRealtime();
    
    return () => {
      // Safely cleanup realtime listeners
      const cleanupRealtime = async () => {
        try {
          if (channels.length > 0) {
            const { cleanupRealtimeListeners } = await import("@/lib/realtime");
            cleanupRealtimeListeners(channels);
          }
        } catch (error) {
          console.warn("Realtime cleanup failed:", error);
        }
      };
      
      cleanupRealtime();
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
