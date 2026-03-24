-- Enable Row Level Security on all tables
ALTER TABLE mairies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES FOR MAIRIES TABLE
-- ============================================

-- Admins can do everything
CREATE POLICY "Admins can view all mairies"
    ON mairies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert mairies"
    ON mairies FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update mairies"
    ON mairies FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Agents can view their own mairie
CREATE POLICY "Agents can view their mairie"
    ON mairies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.mairie_id = mairies.id
        )
    );

-- Citizens can view all mairies (for selection)
CREATE POLICY "Citizens can view all mairies"
    ON mairies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'citoyen'
        )
    );

-- ============================================
-- POLICIES FOR USERS TABLE
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Admins can manage users
CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- ============================================
-- POLICIES FOR BIRTH_RECORDS TABLE
-- ============================================

-- Agents can view records from their mairie
CREATE POLICY "Agents can view their mairie records"
    ON birth_records FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'agent'
            AND users.mairie_id = birth_records.mairie_id
        )
    );

-- Agents can insert records in their mairie
CREATE POLICY "Agents can insert records in their mairie"
    ON birth_records FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'agent'
            AND users.mairie_id = birth_records.mairie_id
        )
    );

-- Admins can view all records
CREATE POLICY "Admins can view all birth records"
    ON birth_records FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================
-- POLICIES FOR REQUESTS TABLE
-- ============================================

-- Citizens can view their own requests
CREATE POLICY "Citizens can view own requests"
    ON requests FOR SELECT
    TO authenticated
    USING (citizen_id = auth.uid());

-- Citizens can create requests
CREATE POLICY "Citizens can create requests"
    ON requests FOR INSERT
    TO authenticated
    WITH CHECK (citizen_id = auth.uid());

-- Agents can view requests for their mairie
CREATE POLICY "Agents can view their mairie requests"
    ON requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'agent'
            AND users.mairie_id = requests.mairie_id
        )
    );

-- Agents can update requests for their mairie
CREATE POLICY "Agents can update their mairie requests"
    ON requests FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'agent'
            AND users.mairie_id = requests.mairie_id
        )
    );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
    ON requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Admins can update all requests
CREATE POLICY "Admins can update all requests"
    ON requests FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ============================================
-- POLICIES FOR PAYMENTS TABLE
-- ============================================

-- Citizens can view their own payments
CREATE POLICY "Citizens can view own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = payments.request_id
            AND requests.citizen_id = auth.uid()
        )
    );

-- Citizens can create payments for their requests
CREATE POLICY "Citizens can create payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = payments.request_id
            AND requests.citizen_id = auth.uid()
        )
    );

-- Agents can view payments for their mairie requests
CREATE POLICY "Agents can view their mairie payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM requests
            JOIN users ON users.id = auth.uid()
            WHERE requests.id = payments.request_id
            AND users.role = 'agent'
            AND users.mairie_id = requests.mairie_id
        )
    );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
    ON payments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );
