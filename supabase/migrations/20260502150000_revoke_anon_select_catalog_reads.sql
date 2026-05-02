-- Routes /api/faqs, /api/testimonials, /api/subjects utilisent désormais la service_role (RLS contournée).
-- Plus besoin de SELECT pour le rôle anon sur ces tables → réduit l’exposition GraphQL / introspection.
REVOKE SELECT ON TABLE public.faqs FROM anon;
REVOKE SELECT ON TABLE public.reviews FROM anon;
REVOKE SELECT ON TABLE public.subjects FROM anon;
