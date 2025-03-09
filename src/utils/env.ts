
export const getEnvVariable = (key: string): string | undefined => {
  // Check if we're in Deno environment (Supabase Edge Functions)
  if (typeof Deno !== 'undefined') {
    const value = Deno.env.get(key);
    console.log('🦕 Getting env from Deno:', { key });
    return value;
  }
  
  // For local development (Vite)
  const value = import.meta.env[key];
  console.log('⚡ Getting env from Vite:', { key });
  return value;
};
