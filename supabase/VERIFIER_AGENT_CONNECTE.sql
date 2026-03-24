-- ============================================
-- VÉRIFIER L'AGENT CONNECTÉ
-- ============================================
-- Vérifier pourquoi le dashboard affiche des données de test
-- ============================================

-- 1. VOIR TOUS LES AGENTS
SELECT 
  u.id,
  u.email,
  u.nom,
  u.prenom,
  u.mairie_id,
  m.nom_mairie,
  u.created_at
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.role = 'agent'
ORDER BY u.created_at DESC;

-- 2. VÉRIFIER SI L'AGENT A UNE MAIRIE ASSIGNÉE
-- Remplacer 'email@agent.ci' par l'email de votre agent
SELECT 
  u.id,
  u.email,
  u.nom,
  u.prenom,
  u.mairie_id,
  CASE 
    WHEN u.mairie_id IS NULL THEN '❌ PAS DE MAIRIE ASSIGNÉE'
    ELSE '✅ Mairie assignée'
  END as statut_mairie,
  m.nom_mairie
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.email = 'votre.agent@mairie.ci';  -- REMPLACER ICI

-- 3. ASSIGNER UNE MAIRIE À L'AGENT (si pas assignée)
-- Remplacer les valeurs
UPDATE public.users
SET mairie_id = (
  SELECT id FROM public.mairies LIMIT 1  -- Prend la première mairie
)
WHERE email = 'votre.agent@mairie.ci'  -- REMPLACER ICI
AND mairie_id IS NULL;

-- 4. VÉRIFIER LES DONNÉES POUR CETTE MAIRIE
-- Remplacer 'ID_MAIRIE' par l'ID de la mairie de l'agent
SELECT 
  'Demandes' as type,
  COUNT(*) as total
FROM public.requests
WHERE mairie_id = 'ID_MAIRIE'  -- REMPLACER ICI
UNION ALL
SELECT 
  'Naissances' as type,
  COUNT(*) as total
FROM public.naissances
WHERE mairie_id = 'ID_MAIRIE'  -- REMPLACER ICI
UNION ALL
SELECT 
  'Mariages' as type,
  COUNT(*) as total
FROM public.mariages
WHERE mairie_id = 'ID_MAIRIE'  -- REMPLACER ICI
UNION ALL
SELECT 
  'Décès' as type,
  COUNT(*) as total
FROM public.deces
WHERE mairie_id = 'ID_MAIRIE';  -- REMPLACER ICI

-- 5. AJOUTER DES DONNÉES DE TEST POUR LA MAIRIE
-- Remplacer 'ID_MAIRIE' par l'ID de la mairie de l'agent

-- Ajouter une naissance
INSERT INTO public.naissances (mairie_id, nom, prenom, date_naissance, lieu_naissance, sexe, numero_acte)
VALUES (
  'ID_MAIRIE',  -- REMPLACER ICI
  'Test',
  'Bébé',
  CURRENT_DATE,
  'Abidjan',
  'M',
  'N-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS')
);

-- Ajouter une demande
INSERT INTO public.requests (mairie_id, user_id, type_document, statut, nom, prenom)
SELECT 
  'ID_MAIRIE',  -- REMPLACER ICI
  u.id,
  'extrait_naissance',
  'en_attente',
  'Kouassi',
  'Jean'
FROM public.users u
WHERE u.role = 'citoyen'
LIMIT 1;

-- ============================================
-- SOLUTION RAPIDE : ASSIGNER PREMIÈRE MAIRIE
-- ============================================

-- Assigner la première mairie à tous les agents sans mairie
UPDATE public.users
SET mairie_id = (SELECT id FROM public.mairies LIMIT 1)
WHERE role = 'agent'
AND mairie_id IS NULL;

-- Vérifier
SELECT 
  u.email,
  u.nom,
  u.prenom,
  m.nom_mairie,
  CASE 
    WHEN u.mairie_id IS NULL THEN '❌ Pas de mairie'
    ELSE '✅ Mairie OK'
  END as statut
FROM public.users u
LEFT JOIN public.mairies m ON u.mairie_id = m.id
WHERE u.role = 'agent';

-- ============================================
-- NOTES
-- ============================================
-- Si l'agent n'a pas de mairie_id :
-- 1. Le dashboard ne trouvera aucune donnée
-- 2. Il affichera 0 partout
-- 
-- Solution : Assigner une mairie à l'agent
-- ============================================
