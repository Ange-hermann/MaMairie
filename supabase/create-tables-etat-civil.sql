-- ============================================
-- CRÉER LES TABLES ÉTAT CIVIL
-- ============================================
-- Tables pour naissances, mariages, décès
-- ============================================

-- 1. Table naissances
CREATE TABLE IF NOT EXISTS public.naissances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id),
  agent_id UUID REFERENCES public.users(id),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance VARCHAR(255),
  sexe VARCHAR(10),
  nom_pere VARCHAR(255),
  nom_mere VARCHAR(255),
  numero_acte VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Table mariages
CREATE TABLE IF NOT EXISTS public.mariages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id),
  agent_id UUID REFERENCES public.users(id),
  nom_epoux VARCHAR(255) NOT NULL,
  prenom_epoux VARCHAR(255) NOT NULL,
  nom_epouse VARCHAR(255) NOT NULL,
  prenom_epouse VARCHAR(255) NOT NULL,
  date_mariage DATE NOT NULL,
  lieu_mariage VARCHAR(255),
  numero_acte VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Table deces
CREATE TABLE IF NOT EXISTS public.deces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id),
  agent_id UUID REFERENCES public.users(id),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  date_deces DATE NOT NULL,
  lieu_deces VARCHAR(255),
  cause_deces TEXT,
  numero_acte VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DÉSACTIVER RLS (pour simplifier)
-- ============================================
ALTER TABLE public.naissances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mariages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deces DISABLE ROW LEVEL SECURITY;

-- ============================================
-- AJOUTER DES DONNÉES DE TEST
-- ============================================

-- Données de test pour naissances
INSERT INTO public.naissances (mairie_id, nom, prenom, date_naissance, lieu_naissance, sexe, nom_pere, nom_mere, numero_acte)
SELECT 
  m.id,
  'Kouassi',
  'Jean',
  '2024-01-15',
  'Abidjan',
  'M',
  'Kouassi Pierre',
  'Kone Marie',
  'N-2024-001'
FROM public.mairies m
LIMIT 1
ON CONFLICT (numero_acte) DO NOTHING;

-- Données de test pour mariages
INSERT INTO public.mariages (mairie_id, nom_epoux, prenom_epoux, nom_epouse, prenom_epouse, date_mariage, lieu_mariage, numero_acte)
SELECT 
  m.id,
  'Toure',
  'Ibrahim',
  'Kone',
  'Fatou',
  '2024-02-14',
  'Abidjan',
  'M-2024-001'
FROM public.mairies m
LIMIT 1
ON CONFLICT (numero_acte) DO NOTHING;

-- Données de test pour décès
INSERT INTO public.deces (mairie_id, nom, prenom, date_deces, lieu_deces, cause_deces, numero_acte)
SELECT 
  m.id,
  'Yao',
  'Kouame',
  '2024-03-10',
  'Abidjan',
  'Maladie',
  'D-2024-001'
FROM public.mairies m
LIMIT 1
ON CONFLICT (numero_acte) DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir les naissances
SELECT * FROM public.naissances;

-- Voir les mariages
SELECT * FROM public.mariages;

-- Voir les décès
SELECT * FROM public.deces;

-- Compter
SELECT 
  'naissances' as table_name,
  COUNT(*) as total
FROM public.naissances
UNION ALL
SELECT 
  'mariages' as table_name,
  COUNT(*) as total
FROM public.mariages
UNION ALL
SELECT 
  'deces' as table_name,
  COUNT(*) as total
FROM public.deces;

-- ============================================
-- NOTES
-- ============================================
-- Après avoir exécuté ce script :
-- 1. Les tables naissances, mariages, deces sont créées
-- 2. Des données de test sont ajoutées
-- 3. Le dashboard agent affichera les vraies données
-- ============================================
