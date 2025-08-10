type Cfg = { url: string; anon: string };

export function getSupabaseConfig(): Cfg {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  if (host.includes("prod-ton-domaine.com")) {
    return {
      url: "https://YOUR_PROD_PROJECT.supabase.co",
      anon: "YOUR_PROD_ANON_KEY",
    };
  }
  // Staging (default)
  return {
    url: "https://alfflpvdnywwbrzygmoc.supabase.co",
    anon: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY",
  };
}
