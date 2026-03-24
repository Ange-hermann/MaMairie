-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('citoyen', 'agent', 'admin');
CREATE TYPE request_status AS ENUM ('en_attente', 'en_cours', 'validee', 'rejetee');
CREATE TYPE payment_status AS ENUM ('en_attente', 'valide', 'echoue');
CREATE TYPE payment_method AS ENUM ('mobile_money', 'carte_bancaire');

-- Table: mairies
CREATE TABLE mairies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom_mairie VARCHAR(255) NOT NULL,
    ville VARCHAR(255) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    code_mairie VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'citoyen',
    mairie_id UUID REFERENCES mairies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: birth_records
CREATE TABLE birth_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(255) NOT NULL,
    pere VARCHAR(255) NOT NULL,
    mere VARCHAR(255) NOT NULL,
    numero_registre VARCHAR(100) UNIQUE NOT NULL,
    mairie_id UUID REFERENCES mairies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: requests
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mairie_id UUID REFERENCES mairies(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(255) NOT NULL,
    nom_pere VARCHAR(255) NOT NULL,
    nom_mere VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    statut request_status NOT NULL DEFAULT 'en_attente',
    date_demande TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pdf_url TEXT,
    numero_document VARCHAR(100) UNIQUE,
    motif_rejet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    mode_paiement payment_method NOT NULL,
    statut_paiement payment_status NOT NULL DEFAULT 'en_attente',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_mairie ON users(mairie_id);
CREATE INDEX idx_requests_citizen ON requests(citizen_id);
CREATE INDEX idx_requests_mairie ON requests(mairie_id);
CREATE INDEX idx_requests_statut ON requests(statut);
CREATE INDEX idx_requests_date ON requests(date_demande);
CREATE INDEX idx_payments_request ON payments(request_id);
CREATE INDEX idx_birth_records_mairie ON birth_records(mairie_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_mairies_updated_at BEFORE UPDATE ON mairies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_birth_records_updated_at BEFORE UPDATE ON birth_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate document number
CREATE OR REPLACE FUNCTION generate_document_number(
    p_pays VARCHAR,
    p_code_mairie VARCHAR,
    p_annee INTEGER
)
RETURNS VARCHAR AS $$
DECLARE
    v_count INTEGER;
    v_numero VARCHAR;
BEGIN
    -- Count existing documents for this year and mairie
    SELECT COUNT(*) INTO v_count
    FROM requests
    WHERE mairie_id IN (SELECT id FROM mairies WHERE code_mairie = p_code_mairie)
    AND EXTRACT(YEAR FROM date_demande) = p_annee
    AND numero_document IS NOT NULL;
    
    -- Generate new number
    v_numero := LPAD((v_count + 1)::TEXT, 6, '0');
    
    RETURN p_pays || '-' || p_code_mairie || '-' || p_annee || '-' || v_numero;
END;
$$ LANGUAGE plpgsql;
