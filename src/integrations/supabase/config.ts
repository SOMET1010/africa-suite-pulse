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
  
  // Use environment variables instead of hardcoded values
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }
  
  return {
    url: supabaseUrl,
    anon: supabaseAnonKey,
  };
}