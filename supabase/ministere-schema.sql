-- ============================================
-- SCHÉMA BASE DE DONNÉES - NIVEAU MINISTÈRE
-- ============================================
-- Système national de gestion de l'état civil
-- Supervision de toutes les mairies de Côte d'Ivoire
-- ============================================

-- 0. Ajouter le rôle "ministere" à l'enum user_role
-- Note: Cette commande doit être exécutée SEULE dans une transaction
-- Si vous obtenez une erreur, exécutez d'abord:
-- ALTER TYPE user_role ADD VALUE 'ministere';
-- Puis exécutez le reste du script

-- 1. Mise à jour table mairies avec infos géographiques
ALTER TABLE public.mairies 
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS departement VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS date_activation TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS population_estimee INTEGER,
ADD COLUMN IF NOT EXISTS nombre_agents INTEGER DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN public.mairies.region IS 'Région administrative (ex: Abidjan, Haut-Sassandra)';
COMMENT ON COLUMN public.mairies.departement IS 'Département';
COMMENT ON COLUMN public.mairies.statut IS 'active, inactive, suspendue';
COMMENT ON COLUMN public.mairies.population_estimee IS 'Population estimée de la commune';

-- 2. Table des régions de Côte d'Ivoire
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) UNIQUE,
  chef_lieu VARCHAR(100),
  population INTEGER,
  superficie DECIMAL(10, 2),
  nombre_departements INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.regions IS 'Régions administratives de Côte d''Ivoire';

-- 3. Table statistiques nationales (cache)
CREATE TABLE IF NOT EXISTS public.statistiques_nationales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_naissances INTEGER DEFAULT 0,
  total_mariages INTEGER DEFAULT 0,
  total_deces INTEGER DEFAULT 0,
  total_demandes INTEGER DEFAULT 0,
  total_actes_generes INTEGER DEFAULT 0,
  total_mairies_actives INTEGER DEFAULT 0,
  total_agents INTEGER DEFAULT 0,
  temps_moyen_traitement DECIMAL(5, 2), -- en jours
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.statistiques_nationales IS 'Statistiques nationales quotidiennes (cache pour performance)';

-- 4. Table performance des mairies
CREATE TABLE IF NOT EXISTS public.performance_mairies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mairie_id UUID REFERENCES public.mairies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  demandes_traitees INTEGER DEFAULT 0,
  demandes_en_attente INTEGER DEFAULT 0,
  temps_moyen_traitement DECIMAL(5, 2), -- en jours
  taux_validation DECIMAL(5, 2), -- pourcentage
  taux_rejet DECIMAL(5, 2), -- pourcentage
  naissances_enregistrees INTEGER DEFAULT 0,
  mariages_enregistres INTEGER DEFAULT 0,
  deces_enregistres INTEGER DEFAULT 0,
  actes_generes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mairie_id, date)
);

COMMENT ON TABLE public.performance_mairies IS 'Performance quotidienne de chaque mairie';

-- 5. Table alertes et anomalies
CREATE TABLE IF NOT EXISTS public.alertes_ministere (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- fraude, retard, erreur, anomalie
  severite VARCHAR(20) DEFAULT 'moyenne', -- faible, moyenne, haute, critique
  mairie_id UUID REFERENCES public.mairies(id),
  agent_id UUID REFERENCES public.users(id),
  acte_id UUID, -- ID de l'acte concerné (naissance, mariage, décès)
  acte_type VARCHAR(20), -- naissance, mariage, deces
  titre VARCHAR(200) NOT NULL,
  description TEXT,
  statut VARCHAR(20) DEFAULT 'nouvelle', -- nouvelle, en_cours, resolue, ignoree
  date_detection TIMESTAMP DEFAULT NOW(),
  date_resolution TIMESTAMP,
  resolu_par UUID REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.alertes_ministere IS 'Alertes et anomalies détectées au niveau national';

-- 6. Table vérification des actes
CREATE TABLE IF NOT EXISTS public.verifications_actes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_acte VARCHAR(50) NOT NULL,
  type_acte VARCHAR(20) NOT NULL, -- naissance, mariage, deces
  acte_id UUID NOT NULL,
  mairie_id UUID REFERENCES public.mairies(id),
  qr_code_hash VARCHAR(255) UNIQUE,
  statut_verification VARCHAR(20) DEFAULT 'valide', -- valide, invalide, suspect
  nombre_verifications INTEGER DEFAULT 0,
  derniere_verification TIMESTAMP,
  ip_derniere_verification VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.verifications_actes IS 'Registre national de vérification des actes';

-- 7. Table audit des actions ministère
CREATE TABLE IF NOT EXISTS public.audit_ministere (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(100) NOT NULL,
  entite_type VARCHAR(50), -- mairie, agent, acte, etc.
  entite_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.audit_ministere IS 'Journal d''audit de toutes les actions du ministère';

-- 8. Index pour performance
CREATE INDEX IF NOT EXISTS idx_performance_mairies_date ON public.performance_mairies(date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_mairies_mairie ON public.performance_mairies(mairie_id);
CREATE INDEX IF NOT EXISTS idx_alertes_statut ON public.alertes_ministere(statut);
CREATE INDEX IF NOT EXISTS idx_alertes_severite ON public.alertes_ministere(severite);
CREATE INDEX IF NOT EXISTS idx_alertes_date ON public.alertes_ministere(date_detection DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_numero ON public.verifications_actes(numero_acte);
CREATE INDEX IF NOT EXISTS idx_verifications_qr ON public.verifications_actes(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_ministere(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.audit_ministere(created_at DESC);

-- 9. Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stats_nationales_updated_at BEFORE UPDATE ON public.statistiques_nationales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_updated_at BEFORE UPDATE ON public.performance_mairies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alertes_updated_at BEFORE UPDATE ON public.alertes_ministere
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications_actes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Fonction pour calculer les statistiques nationales
CREATE OR REPLACE FUNCTION calculer_statistiques_nationales(date_calcul DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.statistiques_nationales (
    date,
    total_naissances,
    total_mariages,
    total_deces,
    total_demandes,
    total_mairies_actives,
    total_agents
  )
  SELECT
    date_calcul,
    (SELECT COUNT(*) FROM public.naissances WHERE DATE(created_at) = date_calcul),
    (SELECT COUNT(*) FROM public.mariages WHERE DATE(created_at) = date_calcul),
    (SELECT COUNT(*) FROM public.deces WHERE DATE(created_at) = date_calcul),
    (SELECT COUNT(*) FROM public.requests WHERE DATE(created_at) = date_calcul),
    (SELECT COUNT(*) FROM public.mairies WHERE statut = 'active'),
    (SELECT COUNT(*) FROM public.users WHERE role = 'agent')
  ON CONFLICT (date) DO UPDATE SET
    total_naissances = EXCLUDED.total_naissances,
    total_mariages = EXCLUDED.total_mariages,
    total_deces = EXCLUDED.total_deces,
    total_demandes = EXCLUDED.total_demandes,
    total_mairies_actives = EXCLUDED.total_mairies_actives,
    total_agents = EXCLUDED.total_agents,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. Fonction pour détecter les anomalies
CREATE OR REPLACE FUNCTION detecter_anomalies()
RETURNS VOID AS $$
BEGIN
  -- Détecter les mairies avec retard important
  INSERT INTO public.alertes_ministere (type, severite, mairie_id, titre, description)
  SELECT 
    'retard',
    'haute',
    m.id,
    'Retard important dans le traitement',
    'La mairie a ' || COUNT(r.id) || ' demandes en attente depuis plus de 7 jours'
  FROM public.mairies m
  JOIN public.requests r ON r.mairie_id = m.id
  WHERE r.statut = 'en_attente'
    AND r.created_at < NOW() - INTERVAL '7 days'
  GROUP BY m.id
  HAVING COUNT(r.id) > 10
  ON CONFLICT DO NOTHING;
  
  -- Détecter les actes suspects (doublons potentiels)
  -- À implémenter selon les règles métier
END;
$$ LANGUAGE plpgsql;

-- 12. Données initiales - Régions de Côte d'Ivoire
INSERT INTO public.regions (nom, code, chef_lieu, nombre_departements) VALUES
('Abidjan', 'AB', 'Abidjan', 13),
('Bas-Sassandra', 'BS', 'San-Pédro', 3),
('Comoé', 'CM', 'Abengourou', 3),
('Denguélé', 'DE', 'Odienné', 2),
('Gôh-Djiboua', 'GD', 'Gagnoa', 4),
('Lacs', 'LC', 'Yamoussoukro', 3),
('Lagunes', 'LG', 'Dabou', 4),
('Montagnes', 'MO', 'Man', 3),
('Sassandra-Marahoué', 'SM', 'Daloa', 3),
('Savanes', 'SV', 'Korhogo', 3),
('Vallée du Bandama', 'VB', 'Bouaké', 4),
('Woroba', 'WO', 'Séguéla', 3),
('Yamoussoukro', 'YA', 'Yamoussoukro', 1),
('Zanzan', 'ZZ', 'Bondoukou', 2)
ON CONFLICT (nom) DO NOTHING;

-- 13. RLS Policies pour le ministère
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistiques_nationales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_mairies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertes_ministere ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications_actes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_ministere ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture pour tous les utilisateurs ministère
CREATE POLICY "Ministere peut tout voir" ON public.regions
  FOR SELECT USING (true);

CREATE POLICY "Ministere peut voir stats" ON public.statistiques_nationales
  FOR SELECT USING (true);

CREATE POLICY "Ministere peut voir performance" ON public.performance_mairies
  FOR SELECT USING (true);

CREATE POLICY "Ministere peut voir alertes" ON public.alertes_ministere
  FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut verifier actes" ON public.verifications_actes
  FOR SELECT USING (true);

-- Policy: Écriture réservée au ministère
CREATE POLICY "Seul ministere peut modifier" ON public.alertes_ministere
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'ministere'
    )
  );

-- ============================================
-- FIN DU SCHÉMA MINISTÈRE
-- ============================================

-- Vérification
SELECT 'Schéma ministère créé avec succès!' AS message;
