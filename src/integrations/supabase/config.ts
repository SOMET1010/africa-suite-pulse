type Cfg = { url: string; anon: string };

export function getSupabaseConfig(): Cfg {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  
  // Production configuration - MUST be updated before production deployment
  if (host.includes("votre-domaine-production.com")) {
    // SECURITY: Replace these with your actual production Supabase credentials
    return {
      url: "https://YOUR_PRODUCTION_PROJECT_ID.supabase.co",
      anon: "YOUR_PRODUCTION_ANON_KEY_HERE",
    };
  }
  
  // Development/Staging (current configuration)
  return {
    url: "https://alfflpvdnywwbrzygmoc.supabase.co",
    anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY",
  };
}
