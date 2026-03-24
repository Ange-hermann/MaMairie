-- Seed data for testing

-- Insert sample mairies
INSERT INTO mairies (id, nom_mairie, ville, pays, code_mairie) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Mairie de Cocody', 'Abidjan', 'CI', 'COC'),
    ('22222222-2222-2222-2222-222222222222', 'Mairie de Yopougon', 'Abidjan', 'CI', 'YOP'),
    ('33333333-3333-3333-3333-333333333333', 'Mairie d''Abobo', 'Abidjan', 'CI', 'ABO'),
    ('44444444-4444-4444-4444-444444444444', 'Mairie de Plateau', 'Abidjan', 'CI', 'PLA');

-- Note: Users will be created through Supabase Auth
-- After auth signup, you can update their profile with:
-- UPDATE users SET role = 'agent', mairie_id = '11111111-1111-1111-1111-111111111111' 
-- WHERE email = 'agent@mairie.com';

-- Sample birth records
INSERT INTO birth_records (nom, prenom, date_naissance, lieu_naissance, pere, mere, numero_registre, mairie_id) VALUES
    ('Kouadio', 'Jean', '1990-05-15', 'Abidjan', 'Kouadio Yao', 'N''Guessan Aya', 'REG-COC-1990-001', '11111111-1111-1111-1111-111111111111'),
    ('Touré', 'Koffi', '1985-08-20', 'Abidjan', 'Touré Mamadou', 'Diallo Fatoumata', 'REG-YOP-1985-002', '22222222-2222-2222-2222-222222222222'),
    ('N''Dri', 'Marie', '1992-03-10', 'Abidjan', 'N''Dri Konan', 'Bamba Adjoua', 'REG-ABO-1992-003', '33333333-3333-3333-3333-333333333333');

-- Sample requests (you'll need to replace citizen_id with actual user IDs after signup)
-- INSERT INTO requests (citizen_id, mairie_id, nom, prenom, date_naissance, lieu_naissance, nom_pere, nom_mere, telephone, statut) VALUES
--     ('user-uuid-here', '11111111-1111-1111-1111-111111111111', 'Kouadio', 'Jean', '1990-05-15', 'Abidjan', 'Kouadio Yao', 'N''Guessan Aya', '+225 07 12 34 56 78', 'en_attente');
