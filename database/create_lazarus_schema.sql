-- Lazarus Home Remodeling Database Schema
-- Compatible with TileShop RAG PostgreSQL Architecture for Future Integration
-- Created: 2025-07-25

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- SECTION 1: CUSTOMERS & LEADS MANAGEMENT
-- ===========================================

-- 1. CUSTOMERS Table (Compatible with TileShop customers schema)
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone_primary VARCHAR(20),
    phone_normalized VARCHAR(15), -- E.164 format for consistency
    phone_secondary VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    customer_type VARCHAR(50) DEFAULT 'homeowner' CHECK (customer_type IN ('homeowner', 'contractor', 'designer', 'builder', 'property_manager')),
    preferred_contact_method VARCHAR(20) DEFAULT 'phone' CHECK (preferred_contact_method IN ('phone', 'email', 'text')),
    marketing_opt_in BOOLEAN DEFAULT false,
    lead_source VARCHAR(100), -- 'website_chat', 'contact_form', 'hero_form', 'referral', 'social_media'
    lead_status VARCHAR(50) DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'quoted', 'converted', 'lost')),
    assigned_to VARCHAR(100), -- Sales rep or team member
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 2. PROJECTS Table (Enhanced for home remodeling)
CREATE TABLE IF NOT EXISTS projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN (
        'kitchen_remodeling', 'bathroom_remodeling', 'whole_home_renovation', 
        'room_addition', 'basement_finishing', 'flooring_installation',
        'walk_in_tub_installation', 'accessibility_modifications', 'custom_carpentry',
        'plumbing_services', 'electrical_work', 'interior_renovation', 'other'
    )),
    project_status VARCHAR(50) DEFAULT 'inquiry' CHECK (project_status IN (
        'inquiry', 'consultation_scheduled', 'consultation_completed', 'quoted', 
        'contract_signed', 'in_progress', 'completed', 'cancelled', 'on_hold'
    )),
    total_budget_min DECIMAL(10,2),
    total_budget_max DECIMAL(10,2),
    estimated_value DECIMAL(10,2),
    final_contract_amount DECIMAL(10,2),
    project_start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'rush')),
    timeline_preference VARCHAR(50), -- 'asap', '1_month', '3_months', 'planning_ahead'
    installation_method VARCHAR(50) DEFAULT 'professional' CHECK (installation_method IN ('professional', 'diy_assistance', 'consultation_only')),
    lead_source VARCHAR(100),
    sales_associate VARCHAR(100),
    project_manager VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- ===========================================
-- SECTION 2: FORM SUBMISSIONS & INTERACTIONS
-- ===========================================

-- 3. FORM_SUBMISSIONS Table (Consolidates all form types)
CREATE TABLE IF NOT EXISTS form_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(customer_id),
    project_id UUID REFERENCES projects(project_id),
    form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('contact_form', 'hero_form', 'consultation_form', 'walk_in_tub_form')),
    submission_data JSONB NOT NULL, -- Flexible storage for all form fields
    submission_status VARCHAR(50) DEFAULT 'received' CHECK (submission_status IN ('received', 'processed', 'contacted', 'converted')),
    source_page VARCHAR(255), -- URL where form was submitted
    user_agent TEXT,
    ip_address INET,
    referrer_url VARCHAR(500),
    admin_email_sent BOOLEAN DEFAULT false,
    admin_email_sent_at TIMESTAMP,
    user_confirmation_sent BOOLEAN DEFAULT false,
    user_confirmation_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(100)
);

-- ===========================================
-- SECTION 3: CHAT SYSTEM & CONVERSATIONS
-- ===========================================

-- 4. CHAT_SESSIONS Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(customer_id),
    project_id UUID REFERENCES projects(project_id),
    session_type VARCHAR(50) DEFAULT 'customer_support' CHECK (session_type IN ('customer_support', 'sales', 'consultation_booking')),
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'abandoned')),
    page_url VARCHAR(500), -- Where chat was initiated
    user_agent TEXT,
    ip_address INET,
    total_messages INTEGER DEFAULT 0,
    session_duration_seconds INTEGER,
    booking_completed BOOLEAN DEFAULT false,
    booking_data JSONB, -- Store booking details if completed
    conversion_achieved BOOLEAN DEFAULT false,
    conversion_type VARCHAR(50), -- 'booking', 'contact_info', 'lead_qualified'
    ai_model_used VARCHAR(50) DEFAULT 'demo', -- 'openai', 'demo', 'anthropic'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CHAT_MESSAGES Table
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    message_order INTEGER NOT NULL, -- Sequence within session
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Store additional context, confidence scores, etc.
    ai_model VARCHAR(50), -- Which AI model generated this response
    response_time_ms INTEGER, -- Time to generate AI response
    booking_flow_step INTEGER, -- Which step in booking flow (1-5)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CHAT_BOOKINGS Table (Extracted from completed chat sessions)
CREATE TABLE IF NOT EXISTS chat_bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id),
    customer_id UUID REFERENCES customers(customer_id),
    project_id UUID REFERENCES projects(project_id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    project_type VARCHAR(50),
    appointment_preference JSONB, -- Store preferred dates/times
    booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    admin_notified BOOLEAN DEFAULT false,
    admin_notification_sent_at TIMESTAMP,
    customer_confirmation_sent BOOLEAN DEFAULT false,
    customer_confirmation_sent_at TIMESTAMP,
    consultation_scheduled_at TIMESTAMP,
    consultation_completed_at TIMESTAMP,
    follow_up_required BOOLEAN DEFAULT true,
    next_follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- ===========================================
-- SECTION 4: EMAIL & NOTIFICATION TRACKING
-- ===========================================

-- 7. EMAIL_NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS email_notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_table VARCHAR(50) NOT NULL, -- 'form_submissions', 'chat_bookings', etc.
    related_id UUID NOT NULL, -- Foreign key to related record
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN (
        'admin_form_notification', 'admin_chat_booking', 'user_confirmation',
        'consultation_reminder', 'follow_up', 'project_update'
    )),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'customer')),
    subject VARCHAR(255) NOT NULL,
    email_body_html TEXT,
    email_body_text TEXT,
    send_status VARCHAR(20) DEFAULT 'pending' CHECK (send_status IN ('pending', 'sent', 'failed', 'bounced')),
    send_attempts INTEGER DEFAULT 0,
    sent_at TIMESTAMP,
    failed_reason TEXT,
    provider_message_id VARCHAR(255), -- From email service provider
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SECTION 5: ANALYTICS & REPORTING
-- ===========================================

-- 8. ANALYTICS_EVENTS Table
CREATE TABLE IF NOT EXISTS analytics_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(session_id),
    customer_id UUID REFERENCES customers(customer_id),
    event_type VARCHAR(50) NOT NULL, -- 'chat_opened', 'form_submitted', 'booking_completed', etc.
    event_category VARCHAR(50), -- 'engagement', 'conversion', 'technical'
    event_data JSONB DEFAULT '{}',
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- SECTION 6: FUTURE TILESHOP INTEGRATION
-- ===========================================

-- 9. INTEGRATION_MAPPING Table (For future TileShop integration)
CREATE TABLE IF NOT EXISTS integration_mapping (
    mapping_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lazarus_table VARCHAR(50) NOT NULL,
    lazarus_id UUID NOT NULL,
    external_system VARCHAR(50) NOT NULL, -- 'tileshop', 'crm', etc.
    external_table VARCHAR(50),
    external_id VARCHAR(255),
    mapping_type VARCHAR(50), -- 'customer', 'project', 'conversation'
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    last_sync_at TIMESTAMP,
    sync_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_customers_lead_source ON customers(lead_source);
CREATE INDEX IF NOT EXISTS idx_customers_lead_status ON customers(lead_status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Form submission indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_customer ON form_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(submission_status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_data ON form_submissions USING GIN(submission_data);

-- Chat system indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer ON chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_booking_completed ON chat_sessions(booking_completed);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order ON chat_messages(session_id, message_order);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_bookings_session ON chat_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_bookings_customer ON chat_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_bookings_status ON chat_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_chat_bookings_created_at ON chat_bookings(created_at);

-- Email notification indexes
CREATE INDEX IF NOT EXISTS idx_email_notifications_related ON email_notifications(related_table, related_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(send_status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON email_notifications(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_customer ON analytics_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Integration mapping indexes
CREATE INDEX IF NOT EXISTS idx_integration_mapping_lazarus ON integration_mapping(lazarus_table, lazarus_id);
CREATE INDEX IF NOT EXISTS idx_integration_mapping_external ON integration_mapping(external_system, external_id);
CREATE INDEX IF NOT EXISTS idx_integration_mapping_sync_status ON integration_mapping(sync_status);

-- ===========================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===========================================

-- Create update function for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_bookings_updated_at BEFORE UPDATE ON chat_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- Customer dashboard view
CREATE OR REPLACE VIEW customer_dashboard AS
SELECT 
    c.customer_id,
    c.first_name || ' ' || COALESCE(c.last_name, '') AS full_name,
    c.email,
    c.phone_primary,
    c.lead_source,
    c.lead_status,
    c.created_at as customer_since,
    COUNT(DISTINCT p.project_id) as total_projects,
    COUNT(DISTINCT cs.session_id) as total_chat_sessions,
    COUNT(DISTINCT cb.booking_id) as total_bookings,
    COUNT(DISTINCT fs.submission_id) as total_form_submissions,
    MAX(cs.last_activity) as last_chat_activity,
    MAX(p.created_at) as last_project_inquiry
FROM customers c
LEFT JOIN projects p ON c.customer_id = p.customer_id
LEFT JOIN chat_sessions cs ON c.customer_id = cs.customer_id
LEFT JOIN chat_bookings cb ON c.customer_id = cb.customer_id
LEFT JOIN form_submissions fs ON c.customer_id = fs.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.phone_primary, c.lead_source, c.lead_status, c.created_at;

-- Conversation analytics view
CREATE OR REPLACE VIEW conversation_analytics AS
SELECT 
    cs.session_id,
    cs.customer_id,
    cs.session_status,
    cs.booking_completed,
    cs.conversion_achieved,
    cs.total_messages,
    cs.session_duration_seconds,
    cs.started_at,
    cs.ended_at,
    CASE WHEN cb.booking_id IS NOT NULL THEN true ELSE false END as booking_created,
    cb.booking_status
FROM chat_sessions cs
LEFT JOIN chat_bookings cb ON cs.session_id = cb.session_id;

-- Daily analytics summary view
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
    DATE(created_at) as analytics_date,
    COUNT(*) FILTER (WHERE event_type = 'chat_opened') as chats_opened,
    COUNT(*) FILTER (WHERE event_type = 'form_submitted') as forms_submitted,
    COUNT(*) FILTER (WHERE event_type = 'booking_completed') as bookings_completed,
    COUNT(DISTINCT customer_id) as unique_visitors,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY analytics_date DESC;

-- ===========================================
-- INITIAL DATA SETUP
-- ===========================================

-- Insert default admin user for system operations
INSERT INTO customers (
    customer_id, 
    first_name, 
    last_name, 
    email, 
    customer_type, 
    lead_source,
    lead_status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'System',
    'Administrator',
    'admin@lazarushomeremodeling.com',
    'homeowner',
    'system',
    'converted'
) ON CONFLICT (customer_id) DO NOTHING;

-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON TABLE customers IS 'Customer records compatible with TileShop schema for future integration';
COMMENT ON TABLE projects IS 'Home remodeling projects with enhanced tracking for Lazarus services';
COMMENT ON TABLE form_submissions IS 'All website form submissions with flexible JSONB storage';
COMMENT ON TABLE chat_sessions IS 'AI chat sessions with conversation tracking and analytics';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON TABLE chat_bookings IS 'Consultation bookings extracted from chat interactions';
COMMENT ON TABLE email_notifications IS 'Email tracking for all automated notifications';
COMMENT ON TABLE analytics_events IS 'Event tracking for business intelligence';
COMMENT ON TABLE integration_mapping IS 'Future integration mapping for TileShop and other systems';

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Lazarus Home Remodeling database schema created successfully!';
    RAISE NOTICE 'Schema includes % tables with TileShop compatibility', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
            'customers', 'projects', 'form_submissions', 'chat_sessions', 
            'chat_messages', 'chat_bookings', 'email_notifications', 
            'analytics_events', 'integration_mapping'
        ));
END $$;