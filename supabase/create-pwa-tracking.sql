-- ============================================
-- TRACKING DES INSTALLATIONS PWA
-- ============================================
-- Table pour suivre les installations et téléchargements
-- ============================================

-- 1. Créer la table pwa_installs
CREATE TABLE IF NOT EXISTS public.pwa_installs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- 'installed', 'accepted', 'dismissed', 'prompt_dismissed', 'already_installed'
  user_agent TEXT,
  platform VARCHAR(50), -- 'android', 'ios', 'windows', 'macos', 'linux'
  browser VARCHAR(50), -- 'chrome', 'safari', 'firefox', 'edge'
  is_mobile BOOLEAN DEFAULT false,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_pwa_installs_user_id ON public.pwa_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_installs_action ON public.pwa_installs(action);
CREATE INDEX IF NOT EXISTS idx_pwa_installs_created_at ON public.pwa_installs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwa_installs_platform ON public.pwa_installs(platform);

-- 3. Désactiver RLS
ALTER TABLE public.pwa_installs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FONCTION : Enregistrer une installation PWA
-- ============================================
CREATE OR REPLACE FUNCTION track_pwa_install(
  p_user_id UUID DEFAULT NULL,
  p_action VARCHAR DEFAULT 'installed',
  p_user_agent TEXT DEFAULT NULL,
  p_platform VARCHAR DEFAULT NULL,
  p_browser VARCHAR DEFAULT NULL,
  p_is_mobile BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_install_id UUID;
BEGIN
  INSERT INTO public.pwa_installs (
    user_id,
    action,
    user_agent,
    platform,
    browser,
    is_mobile
  )
  VALUES (
    p_user_id,
    p_action,
    p_user_agent,
    p_platform,
    p_browser,
    p_is_mobile
  )
  RETURNING id INTO v_install_id;
  
  RETURN v_install_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VUE : Statistiques PWA
-- ============================================
CREATE OR REPLACE VIEW pwa_stats AS
SELECT
  COUNT(*) FILTER (WHERE action = 'installed') as total_installs,
  COUNT(*) FILTER (WHERE action = 'accepted') as total_accepted,
  COUNT(*) FILTER (WHERE action = 'dismissed') as total_dismissed,
  COUNT(*) FILTER (WHERE action = 'already_installed') as already_installed,
  COUNT(*) FILTER (WHERE platform = 'android') as android_installs,
  COUNT(*) FILTER (WHERE platform = 'ios') as ios_installs,
  COUNT(*) FILTER (WHERE is_mobile = true) as mobile_installs,
  COUNT(*) FILTER (WHERE is_mobile = false) as desktop_installs,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', created_at) as install_date
FROM public.pwa_installs
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY install_date DESC;

-- ============================================
-- REQUÊTES UTILES
-- ============================================

-- Voir toutes les installations
-- SELECT * FROM public.pwa_installs ORDER BY created_at DESC;

-- Statistiques globales
-- SELECT * FROM pwa_stats;

-- Installations par plateforme
-- SELECT platform, COUNT(*) as count
-- FROM public.pwa_installs
-- WHERE action = 'installed'
-- GROUP BY platform
-- ORDER BY count DESC;

-- Installations par jour (derniers 30 jours)
-- SELECT 
--   DATE(created_at) as date,
--   COUNT(*) as installs
-- FROM public.pwa_installs
-- WHERE action = 'installed'
--   AND created_at >= NOW() - INTERVAL '30 days'
-- GROUP BY DATE(created_at)
-- ORDER BY date DESC;

-- Taux de conversion (accepted vs dismissed)
-- SELECT 
--   COUNT(*) FILTER (WHERE action = 'accepted') as accepted,
--   COUNT(*) FILTER (WHERE action = 'dismissed') as dismissed,
--   ROUND(
--     COUNT(*) FILTER (WHERE action = 'accepted')::NUMERIC / 
--     NULLIF(COUNT(*) FILTER (WHERE action IN ('accepted', 'dismissed')), 0) * 100,
--     2
--   ) as conversion_rate
-- FROM public.pwa_installs;

-- Installations par navigateur
-- SELECT 
--   browser,
--   COUNT(*) as count,
--   ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
-- FROM public.pwa_installs
-- WHERE action = 'installed'
-- GROUP BY browser
-- ORDER BY count DESC;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Voir la structure de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pwa_installs'
ORDER BY ordinal_position;

-- ============================================
-- NOTES
-- ============================================
-- Cette table permet de tracker :
-- - Nombre d'installations PWA
-- - Plateformes utilisées (Android, iOS, etc.)
-- - Navigateurs utilisés
-- - Taux de conversion du prompt
-- - Installations par jour/mois
-- - Utilisateurs uniques
-- 
-- Utilisez la vue pwa_stats pour des statistiques rapides
-- ============================================
