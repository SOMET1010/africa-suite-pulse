
type Cfg = { url: string; anon: string };

export function getSupabaseConfig(): Cfg {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  
  // Check deployment mode from environment
  const deploymentMode = typeof window !== "undefined" 
    ? window.localStorage?.getItem('deployment_mode') 
    : process.env.DEPLOYMENT_MODE;
  
  // Self-hosted mode (PostgreSQL local)
  if (deploymentMode === 'selfhosted') {
    return {
      url: process.env.POSTGRES_URL || "http://localhost:54321",
      anon: "local-auth-token", // Simplified auth for self-hosted
    };
  }
  
  // Use the actual Supabase project values
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://alfflpvdnywwbrzygmoc.supabase.co";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY";
  
  return {
    url: supabaseUrl,
    anon: supabaseAnonKey,
  };
}
