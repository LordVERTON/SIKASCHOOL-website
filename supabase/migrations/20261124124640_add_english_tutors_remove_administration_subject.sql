-- Only change teaching subjects; preserve profiles, roles and all other subjects.
-- Also runs on an empty local database before seed.sql creates its demo tutors.
BEGIN;

UPDATE public.tutors AS tutor
SET subjects = ARRAY(
  SELECT subject
  FROM unnest(tutor.subjects) WITH ORDINALITY AS entry(subject, position)
  WHERE lower(btrim(subject)) NOT IN ('administration', 'support', 'administration et support')
  ORDER BY position
)
WHERE EXISTS (
  SELECT 1 FROM unnest(tutor.subjects) AS entry(subject)
  WHERE lower(btrim(subject)) IN ('administration', 'support', 'administration et support')
);

-- Resolve accounts by email, never by production-generated IDs.
WITH english_tutors(email, default_subjects) AS (
  VALUES
    ('alix.tarrade@sikaschool.com', ARRAY['Français', 'Méthodologie', 'Droits', 'Anglais']),
    ('daniel.verton@sikaschool.com', ARRAY['Mathématiques', 'Physique', 'Informatique', 'Sciences de l''ingénieur', 'Anglais']),
    ('vertondan@gmail.com', ARRAY['Mathématiques', 'Physique', 'Informatique', 'Sciences de l''ingénieur', 'Anglais']),
    ('ruudy.mbouza-bayonne@sikaschool.com', ARRAY['Mécanique des fluides', 'Physique', 'Mathématiques', 'Anglais'])
)
INSERT INTO public.tutors (user_id, bio, subjects, is_available)
SELECT profile.id,
  'Tuteur expérimenté - ' || profile.first_name || ' ' || profile.last_name,
  english_tutors.default_subjects,
  true
FROM public.profiles AS profile
JOIN english_tutors ON lower(profile.email) = english_tutors.email
WHERE profile.role IN ('TUTOR', 'ADMIN')
  AND NOT EXISTS (SELECT 1 FROM public.tutors WHERE user_id = profile.id);

UPDATE public.tutors AS tutor
SET subjects = array_append(coalesce(tutor.subjects, ARRAY[]::text[]), 'Anglais')
FROM public.profiles AS profile
WHERE tutor.user_id = profile.id
  AND lower(profile.email) IN (
    'alix.tarrade@sikaschool.com',
    'daniel.verton@sikaschool.com',
    'vertondan@gmail.com',
    'ruudy.mbouza-bayonne@sikaschool.com'
  )
  AND profile.role IN ('TUTOR', 'ADMIN')
  AND NOT EXISTS (
    SELECT 1 FROM unnest(tutor.subjects) AS entry(subject)
    WHERE lower(btrim(subject)) = 'anglais'
  );

COMMIT;
