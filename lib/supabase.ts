import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Client Supabase simple (pour les API routes)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client Supabase avec service role (pour les opérations admin)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Connexion refusée / réseau : Supabase local arrêté ou mauvaise URL. */
export function isSupabaseUnreachableError(err: unknown): boolean {
  const parts: string[] = [];
  const walk = (e: unknown): void => {
    if (e == null) return;
    if (e instanceof Error) {
      parts.push(e.message);
      walk(e.cause);
      return;
    }
    if (typeof e === 'object') {
      try {
        parts.push(JSON.stringify(e));
      } catch {
        parts.push(String(e));
      }
    } else {
      parts.push(String(e));
    }
  };
  walk(err);
  const s = parts.join(' ');
  return /ECONNREFUSED|ETIMEDOUT|fetch failed|ENOTFOUND|UND_ERR_SOCKET|other side closed|connect ECONNREFUSED/i.test(
    s,
  );
}