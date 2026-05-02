-- Lint 0011: fonction avec search_path fixe (évite la substitution de tables dans public).
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Lints 0026 / 0027 : PostgREST expose graphql_public ; par défaut anon/authenticated ont SELECT
-- sur toutes les tables → introspection GraphQL trop large.
-- L’app Next utilise la service_role côté API (pas affectée). En anon, seules les lectures
-- publiques (FAQ, avis, matières) restent autorisées ; les comptes connectés Supabase Auth
-- (authenticated) gardent SELECT sur la messagerie pour Realtime + RLS.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Lectures publiques (les politiques RLS filtrent encore les lignes).
GRANT SELECT ON TABLE public.faqs TO anon;
GRANT SELECT ON TABLE public.reviews TO anon;
GRANT SELECT ON TABLE public.subjects TO anon;

-- Messagerie côté client Supabase (JWT → rôle authenticated) : SELECT requis pour postgres_changes.
GRANT SELECT ON TABLE public.messages TO authenticated;
GRANT SELECT ON TABLE public.message_threads TO authenticated;
GRANT SELECT ON TABLE public.message_thread_participants TO authenticated;
