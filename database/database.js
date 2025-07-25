// Lazarus Home Remodeling Database Module
// PostgreSQL integration with TileShop compatibility

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class LazarusDatabase {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            // Database configuration
            const dbConfig = {
                host: process.env.DATABASE_HOST || 'localhost',
                port: process.env.DATABASE_PORT || 5432,
                database: process.env.DATABASE_NAME || 'lazarus_remodeling',
                user: process.env.DATABASE_USER || 'postgres',
                password: process.env.DATABASE_PASSWORD || '',
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 20, // Maximum number of clients in the pool
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            };

            this.pool = new Pool(dbConfig);

            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            this.isConnected = true;
            console.log('✅ PostgreSQL database connected successfully');

            // Create schema if needed
            await this.createSchemaIfNeeded();

        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            this.isConnected = false;
            
            // Graceful fallback - continue without database
            console.log('⚠️ Running without database - data will be stored in memory/localStorage');
        }
    }

    async createSchemaIfNeeded() {
        if (!this.isConnected) return;

        try {
            const client = await this.pool.connect();

            // Check if customers table exists
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'customers'
                );
            `);

            if (!result.rows[0].exists) {
                console.log('📋 Creating database schema...');
                
                // Read and execute schema file
                const schemaPath = path.join(__dirname, 'create_lazarus_schema.sql');
                const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
                
                await client.query(schemaSQL);
                console.log('✅ Database schema created successfully');
            } else {
                console.log('✅ Database schema already exists');
            }

            client.release();
        } catch (error) {
            console.error('❌ Schema creation failed:', error.message);
        }
    }

    // ===========================================
    // CUSTOMER MANAGEMENT
    // ===========================================

    async createOrUpdateCustomer(customerData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            // Normalize phone number (remove non-digits)
            const phoneNormalized = customerData.phone ? 
                customerData.phone.replace(/\D/g, '') : null;

            // Check if customer exists by email or phone
            let existingCustomer = null;
            if (customerData.email || phoneNormalized) {
                const checkQuery = `
                    SELECT customer_id FROM customers 
                    WHERE email = $1 OR phone_normalized = $2
                    LIMIT 1;
                `;
                const checkResult = await client.query(checkQuery, [
                    customerData.email || null, 
                    phoneNormalized
                ]);
                existingCustomer = checkResult.rows[0];
            }

            let customerId;

            if (existingCustomer) {
                // Update existing customer
                customerId = existingCustomer.customer_id;
                const updateQuery = `
                    UPDATE customers SET 
                        first_name = COALESCE($1, first_name),
                        last_name = COALESCE($2, last_name),
                        email = COALESCE($3, email),
                        phone_primary = COALESCE($4, phone_primary),
                        phone_normalized = COALESCE($5, phone_normalized),
                        address_line1 = COALESCE($6, address_line1),
                        city = COALESCE($7, city),
                        state = COALESCE($8, state),
                        zip_code = COALESCE($9, zip_code),
                        preferred_contact_method = COALESCE($10, preferred_contact_method),
                        lead_source = COALESCE($11, lead_source),
                        updated_at = CURRENT_TIMESTAMP,
                        notes = COALESCE($12, notes)
                    WHERE customer_id = $13
                    RETURNING customer_id;
                `;
                
                await client.query(updateQuery, [
                    customerData.first_name,
                    customerData.last_name,
                    customerData.email,
                    customerData.phone,
                    phoneNormalized,
                    customerData.address,
                    customerData.city,
                    customerData.state,
                    customerData.zip_code,
                    customerData.preferred_contact_method,
                    customerData.lead_source,
                    customerData.notes,
                    customerId
                ]);
            } else {
                // Create new customer
                const insertQuery = `
                    INSERT INTO customers (
                        first_name, last_name, email, phone_primary, phone_normalized,
                        address_line1, city, state, zip_code, preferred_contact_method,
                        lead_source, lead_status, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING customer_id;
                `;

                const result = await client.query(insertQuery, [
                    customerData.first_name,
                    customerData.last_name || null,
                    customerData.email || null,
                    customerData.phone || null,
                    phoneNormalized,
                    customerData.address || null,
                    customerData.city || null,
                    customerData.state || null,
                    customerData.zip_code || null,
                    customerData.preferred_contact_method || 'phone',
                    customerData.lead_source || 'website',
                    'new',
                    customerData.notes || null
                ]);

                customerId = result.rows[0].customer_id;
            }

            client.release();
            return customerId;

        } catch (error) {
            console.error('❌ Error creating/updating customer:', error);
            return null;
        }
    }

    // ===========================================
    // PROJECT MANAGEMENT
    // ===========================================

    async createProject(customerId, projectData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            const insertQuery = `
                INSERT INTO projects (
                    customer_id, project_name, project_type, total_budget_min, 
                    total_budget_max, urgency_level, timeline_preference,
                    installation_method, lead_source, sales_associate, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING project_id;
            `;

            const result = await client.query(insertQuery, [
                customerId,
                projectData.project_name || null,
                projectData.project_type || 'other',
                projectData.budget_min || null,
                projectData.budget_max || null,
                projectData.urgency_level || 'medium',
                projectData.timeline_preference || null,
                projectData.installation_method || 'professional',
                projectData.lead_source || 'website',
                projectData.sales_associate || null,
                projectData.notes || null
            ]);

            const projectId = result.rows[0].project_id;
            client.release();
            return projectId;

        } catch (error) {
            console.error('❌ Error creating project:', error);
            return null;
        }
    }

    // ===========================================
    // FORM SUBMISSIONS
    // ===========================================

    async saveFormSubmission(formData, formType, metadata = {}) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            // Create or update customer
            const customerId = await this.createOrUpdateCustomer({
                first_name: formData.name?.split(' ')[0] || 'Unknown',
                last_name: formData.name?.split(' ').slice(1).join(' ') || null,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                preferred_contact_method: formData['contact-method'] || 'phone',
                lead_source: formType,
                notes: formData.message || formData.notes
            });

            // Create project if services specified
            let projectId = null;
            if (formData.services && customerId) {
                projectId = await this.createProject(customerId, {
                    project_type: Array.isArray(formData.services) ? 
                        formData.services[0] : formData.services,
                    timeline_preference: formData['project-start'] || formData.timeline,
                    notes: formData.message,
                    lead_source: formType
                });
            }

            // Save form submission
            const insertQuery = `
                INSERT INTO form_submissions (
                    customer_id, project_id, form_type, submission_data,
                    source_page, user_agent, ip_address, referrer_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING submission_id;
            `;

            const result = await client.query(insertQuery, [
                customerId,
                projectId,
                formType,
                JSON.stringify(formData),
                metadata.page_url || null,
                metadata.user_agent || null,
                metadata.ip_address || null,
                metadata.referrer || null
            ]);

            const submissionId = result.rows[0].submission_id;
            client.release();

            return {
                submission_id: submissionId,
                customer_id: customerId,
                project_id: projectId
            };

        } catch (error) {
            console.error('❌ Error saving form submission:', error);
            return null;
        }
    }

    // ===========================================
    // CHAT SYSTEM
    // ===========================================

    async createChatSession(sessionData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            const insertQuery = `
                INSERT INTO chat_sessions (
                    customer_id, session_type, page_url, user_agent, ip_address
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING session_id;
            `;

            const result = await client.query(insertQuery, [
                sessionData.customer_id || null,
                sessionData.session_type || 'customer_support',
                sessionData.page_url || null,
                sessionData.user_agent || null,
                sessionData.ip_address || null
            ]);

            const sessionId = result.rows[0].session_id;
            client.release();
            return sessionId;

        } catch (error) {
            console.error('❌ Error creating chat session:', error);
            return null;
        }
    }

    async saveChatMessage(sessionId, role, content, metadata = {}) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            // Get next message order
            const orderQuery = `
                SELECT COALESCE(MAX(message_order), 0) + 1 as next_order
                FROM chat_messages WHERE session_id = $1;
            `;
            const orderResult = await client.query(orderQuery, [sessionId]);
            const messageOrder = orderResult.rows[0].next_order;

            const insertQuery = `
                INSERT INTO chat_messages (
                    session_id, message_order, role, content, metadata,
                    ai_model, response_time_ms, booking_flow_step
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING message_id;
            `;

            const result = await client.query(insertQuery, [
                sessionId,
                messageOrder,
                role,
                content,
                JSON.stringify(metadata),
                metadata.ai_model || null,
                metadata.response_time_ms || null,
                metadata.booking_flow_step || null
            ]);

            // Update session activity
            await client.query(`
                UPDATE chat_sessions SET 
                    total_messages = total_messages + 1,
                    last_activity = CURRENT_TIMESTAMP
                WHERE session_id = $1;
            `, [sessionId]);

            const messageId = result.rows[0].message_id;
            client.release();
            return messageId;

        } catch (error) {
            console.error('❌ Error saving chat message:', error);
            return null;
        }
    }

    async saveChatBooking(bookingData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            // Create or update customer
            const customerId = await this.createOrUpdateCustomer({
                first_name: bookingData.name?.split(' ')[0] || 'Unknown',
                last_name: bookingData.name?.split(' ').slice(1).join(' ') || null,
                email: bookingData.email,
                phone: bookingData.phone,
                lead_source: 'website_chat'
            });

            // Create project
            let projectId = null;
            if (customerId && bookingData.projectType) {
                projectId = await this.createProject(customerId, {
                    project_type: bookingData.projectType,
                    lead_source: 'website_chat',
                    notes: `Chat booking - ${bookingData.projectType}`
                });
            }

            // Save booking
            const insertQuery = `
                INSERT INTO chat_bookings (
                    session_id, customer_id, project_id, customer_name,
                    customer_phone, customer_email, project_type,
                    appointment_preference, project_timeline
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING booking_id;
            `;

            const result = await client.query(insertQuery, [
                bookingData.sessionId || null,
                customerId,
                projectId,
                bookingData.name,
                bookingData.phone,
                bookingData.email,
                bookingData.projectType,
                JSON.stringify(bookingData.appointment_preference || {}),
                bookingData.timeline || null
            ]);

            // Update session as booking completed
            if (bookingData.sessionId) {
                await client.query(`
                    UPDATE chat_sessions SET 
                        booking_completed = true,
                        booking_data = $1,
                        conversion_achieved = true,
                        conversion_type = 'booking'
                    WHERE session_id = $2;
                `, [JSON.stringify(bookingData), bookingData.sessionId]);
            }

            const bookingId = result.rows[0].booking_id;
            client.release();

            return {
                booking_id: bookingId,
                customer_id: customerId,
                project_id: projectId
            };

        } catch (error) {
            console.error('❌ Error saving chat booking:', error);
            return null;
        }
    }

    // ===========================================
    // EMAIL TRACKING
    // ===========================================

    async logEmailNotification(emailData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            const insertQuery = `
                INSERT INTO email_notifications (
                    related_table, related_id, email_type, recipient_email,
                    recipient_type, subject, email_body_html, email_body_text,
                    send_status, provider_message_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING notification_id;
            `;

            const result = await client.query(insertQuery, [
                emailData.related_table,
                emailData.related_id,
                emailData.email_type,
                emailData.recipient_email,
                emailData.recipient_type,
                emailData.subject,
                emailData.email_body_html || null,
                emailData.email_body_text || null,
                emailData.send_status || 'pending',
                emailData.provider_message_id || null
            ]);

            const notificationId = result.rows[0].notification_id;
            client.release();
            return notificationId;

        } catch (error) {
            console.error('❌ Error logging email notification:', error);
            return null;
        }
    }

    async updateEmailStatus(notificationId, status, details = {}) {
        if (!this.isConnected) return false;

        try {
            const client = await this.pool.connect();

            const updateQuery = `
                UPDATE email_notifications SET 
                    send_status = $1,
                    sent_at = CASE WHEN $1 = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END,
                    failed_reason = $2,
                    send_attempts = send_attempts + 1
                WHERE notification_id = $3;
            `;

            await client.query(updateQuery, [
                status,
                details.failed_reason || null,
                notificationId
            ]);

            client.release();
            return true;

        } catch (error) {
            console.error('❌ Error updating email status:', error);
            return false;
        }
    }

    // ===========================================
    // ANALYTICS & REPORTING
    // ===========================================

    async logAnalyticsEvent(eventData) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            const insertQuery = `
                INSERT INTO analytics_events (
                    session_id, customer_id, event_type, event_category,
                    event_data, page_url, user_agent, ip_address
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING event_id;
            `;

            const result = await client.query(insertQuery, [
                eventData.session_id || null,
                eventData.customer_id || null,
                eventData.event_type,
                eventData.event_category || 'general',
                JSON.stringify(eventData.event_data || {}),
                eventData.page_url || null,
                eventData.user_agent || null,
                eventData.ip_address || null
            ]);

            const eventId = result.rows[0].event_id;
            client.release();
            return eventId;

        } catch (error) {
            console.error('❌ Error logging analytics event:', error);
            return null;
        }
    }

    async getDashboardStats() {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();

            const stats = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM chat_sessions WHERE DATE(started_at) = CURRENT_DATE) as today_conversations,
                    (SELECT COUNT(*) FROM chat_bookings WHERE DATE(created_at) = CURRENT_DATE) as today_bookings,
                    (SELECT COUNT(*) FROM form_submissions WHERE DATE(created_at) = CURRENT_DATE) as today_forms,
                    (SELECT COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE) as today_customers,
                    (SELECT COUNT(*) FROM chat_sessions WHERE booking_completed = true) as total_conversions,
                    (SELECT COUNT(*) FROM chat_sessions) as total_conversations,
                    (SELECT ROUND(AVG(session_duration_seconds), 0) FROM chat_sessions WHERE session_duration_seconds IS NOT NULL) as avg_session_duration;
            `);

            client.release();
            return stats.rows[0];

        } catch (error) {
            console.error('❌ Error getting dashboard stats:', error);
            return null;
        }
    }

    async getRecentBookings(limit = 10) {
        if (!this.isConnected) return [];

        try {
            const client = await this.pool.connect();

            const result = await client.query(`
                SELECT 
                    cb.booking_id,
                    cb.customer_name,
                    cb.customer_phone,
                    cb.customer_email,
                    cb.project_type,
                    cb.booking_status,
                    cb.created_at,
                    p.project_name
                FROM chat_bookings cb
                LEFT JOIN projects p ON cb.project_id = p.project_id
                ORDER BY cb.created_at DESC
                LIMIT $1;
            `, [limit]);

            client.release();
            return result.rows;

        } catch (error) {
            console.error('❌ Error getting recent bookings:', error);
            return [];
        }
    }

    async getConversationHistory(limit = 50) {
        if (!this.isConnected) return [];

        try {
            const client = await this.pool.connect();

            const result = await client.query(`
                SELECT 
                    cs.session_id,
                    cs.customer_id,
                    cs.session_status,
                    cs.booking_completed,
                    cs.total_messages,
                    cs.session_duration_seconds,
                    cs.started_at,
                    cs.ended_at,
                    c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name,
                    c.email,
                    c.phone_primary,
                    cb.booking_id IS NOT NULL as has_booking
                FROM chat_sessions cs
                LEFT JOIN customers c ON cs.customer_id = c.customer_id
                LEFT JOIN chat_bookings cb ON cs.session_id = cb.session_id
                ORDER BY cs.started_at DESC
                LIMIT $1;
            `, [limit]);

            client.release();
            return result.rows;

        } catch (error) {
            console.error('❌ Error getting conversation history:', error);
            return [];
        }
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    async query(text, params) {
        if (!this.isConnected) return null;

        try {
            const client = await this.pool.connect();
            const result = await client.query(text, params);
            client.release();
            return result;
        } catch (error) {
            console.error('❌ Database query error:', error);
            return null;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔌 Database connection pool closed');
        }
    }

    isHealthy() {
        return this.isConnected;
    }
}

// Export singleton instance
module.exports = new LazarusDatabase();