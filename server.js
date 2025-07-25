// Lazarus Home Remodeling Backend Server
// Provides OpenAI API proxy to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const database = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Email configuration (Spaceship/Spacemail)
const emailConfig = {
    host: 'mail.spacemail.com',
    port: 465,
    secure: true, // SSL
    auth: {
        user: process.env.EMAIL_USER || 'robert@lazarushomeremodeling.com',
        pass: process.env.EMAIL_PASSWORD
    },
    from: 'robert@lazarushomeremodeling.com'
};

// Create email transporter
let emailTransporter = null;
if (process.env.EMAIL_PASSWORD) {
    try {
        emailTransporter = nodemailer.createTransport(emailConfig);
        console.log('📧 Email service configured');
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
    }
} else {
    console.log('⚠️ Email service disabled - EMAIL_PASSWORD not configured');
}

// Enhanced email service functions
async function sendEmail(emailOptions, notificationData = null) {
    if (!emailTransporter) {
        console.log('📧 Email service not available - email logged locally');
        console.log('Email Options:', emailOptions);
        return { success: false, message: 'Email service not configured' };
    }

    let notificationId = null;
    
    try {
        // Log email to database if notification data provided
        if (notificationData && database.isHealthy()) {
            notificationId = await database.logEmailNotification({
                ...notificationData,
                subject: emailOptions.subject,
                email_body_html: emailOptions.html,
                email_body_text: emailOptions.text,
                recipient_email: emailOptions.to,
                send_status: 'pending'
            });
        }

        const result = await emailTransporter.sendMail(emailOptions);
        console.log('✅ Email sent successfully:', result.messageId);

        // Update database status if tracked
        if (notificationId) {
            await database.updateEmailStatus(notificationId, 'sent', {
                provider_message_id: result.messageId
            });
        }

        return { 
            success: true, 
            messageId: result.messageId,
            notificationId: notificationId
        };
    } catch (error) {
        console.error('❌ Email sending failed:', error);

        // Update database status if tracked
        if (notificationId) {
            await database.updateEmailStatus(notificationId, 'failed', {
                failed_reason: error.message
            });
        }

        return { success: false, error: error.message };
    }
}

async function sendFormEmail(formData, formType) {
    const emailSubject = `New ${formType} Inquiry - Lazarus Home Remodeling`;
    const emailBody = formatFormEmail(formData, formType);

    const adminEmailOptions = {
        from: emailConfig.from,
        to: 'robert@lazarushomeremodeling.com',
        subject: emailSubject,
        html: emailBody,
        text: stripHtml(emailBody)
    };

    const notificationData = {
        related_table: 'form_submissions',
        email_type: 'admin_form_notification',
        recipient_type: 'admin'
    };

    return await sendEmail(adminEmailOptions, notificationData);
}

async function sendUserConfirmationEmail(customerData, submissionType) {
    const subject = 'Thank you for contacting Lazarus Home Remodeling';
    const htmlBody = formatUserConfirmationEmail(customerData, submissionType);

    const userEmailOptions = {
        from: emailConfig.from,
        to: customerData.email,
        subject: subject,
        html: htmlBody,
        text: stripHtml(htmlBody)
    };

    const notificationData = {
        related_table: 'form_submissions',
        email_type: 'user_confirmation',
        recipient_type: 'customer'
    };

    return await sendEmail(userEmailOptions, notificationData);
}

async function sendChatBookingEmails(bookingData) {
    // Send admin notification
    const adminSubject = `New Chat Consultation Booking - ${bookingData.name}`;
    const adminBody = formatChatBookingAdminEmail(bookingData);

    const adminEmailOptions = {
        from: emailConfig.from,
        to: 'robert@lazarushomeremodeling.com',
        subject: adminSubject,
        html: adminBody,
        text: stripHtml(adminBody)
    };

    const adminNotificationData = {
        related_table: 'chat_bookings',
        email_type: 'admin_chat_booking',
        recipient_type: 'admin'
    };

    const adminResult = await sendEmail(adminEmailOptions, adminNotificationData);

    // Send user confirmation
    const userSubject = 'Consultation Request Received - Lazarus Home Remodeling';
    const userBody = formatChatBookingUserEmail(bookingData);

    const userEmailOptions = {
        from: emailConfig.from,
        to: bookingData.email,
        subject: userSubject,
        html: userBody,
        text: stripHtml(userBody)
    };

    const userNotificationData = {
        related_table: 'chat_bookings',
        email_type: 'user_confirmation',
        recipient_type: 'customer'
    };

    const userResult = await sendEmail(userEmailOptions, userNotificationData);

    return {
        admin: adminResult,
        user: userResult
    };
}

function formatFormEmail(formData, formType) {
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    if (formType === 'Hero Multi-Step') {
        return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #dc2626; }
                .value { margin-left: 10px; }
                .services { margin-left: 20px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 New Consultation Request</h1>
                <p>Lazarus Home Remodeling</p>
            </div>
            
            <div class="content">
                <h2>Customer Information</h2>
                <div class="field">
                    <span class="label">Name:</span>
                    <span class="value">${formData.name || 'Not provided'}</span>
                </div>
                <div class="field">
                    <span class="label">Phone:</span>
                    <span class="value">${formData.phone || 'Not provided'}</span>
                </div>
                <div class="field">
                    <span class="label">Email:</span>
                    <span class="value">${formData.email || 'Not provided'}</span>
                </div>
                
                <h2>Project Details</h2>
                ${formData.services ? `
                <div class="field">
                    <span class="label">Project Type:</span>
                    <div class="services">
                        ${Array.isArray(formData.services) ? formData.services.join('<br>') : formData.services}
                    </div>
                </div>
                ` : `
                <div class="field">
                    <span class="label">Project Type:</span>
                    <span class="value">Not specified</span>
                </div>
                `}
                <div class="field">
                    <span class="label">Timeline:</span>
                    <span class="value">${formData['project-start'] || 'Not specified'}</span>
                </div>
                
                <h2>Contact & Scheduling</h2>
                <div class="field">
                    <span class="label">Preferred Contact Method:</span>
                    <span class="value">${formData['contact-method'] || 'Not specified'}</span>
                </div>
                ${formData.address ? `
                <div class="field">
                    <span class="label">Address:</span>
                    <span class="value">${formData.address}</span>
                </div>
                ` : ''}
                ${formData.date ? `
                <div class="field">
                    <span class="label">Preferred Date:</span>
                    <span class="value">${formData.date}</span>
                </div>
                ` : ''}
                ${formData.time ? `
                <div class="field">
                    <span class="label">Preferred Time:</span>
                    <span class="value">${formData.time}</span>
                </div>
                ` : ''}
                
                ${formData.message ? `
                <h2>Project Details</h2>
                <div class="field">
                    <span class="label">Additional Information:</span>
                    <div class="value">${formData.message}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p><strong>Received:</strong> ${timestamp}</p>
                <p><strong>Source:</strong> Website Hero Form</p>
                <p><strong>Next Step:</strong> Contact customer within 24 hours</p>
            </div>
        </body>
        </html>
        `;
    } else if (formType === 'Contact') {
        return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #dc2626; }
                .value { margin-left: 10px; }
                .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📞 New Contact Form Submission</h1>
                <p>Lazarus Home Remodeling</p>
            </div>
            
            <div class="content">
                <h2>Contact Information</h2>
                <div class="field">
                    <span class="label">Name:</span>
                    <span class="value">${formData.name || 'Not provided'}</span>
                </div>
                <div class="field">
                    <span class="label">Email:</span>
                    <span class="value">${formData.email || 'Not provided'}</span>
                </div>
                <div class="field">
                    <span class="label">Phone:</span>
                    <span class="value">${formData.phone || 'Not provided'}</span>
                </div>
                
                <h2>Message</h2>
                <div class="field">
                    <div class="value">${formData.message || 'No message provided'}</div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Received:</strong> ${timestamp}</p>
                <p><strong>Source:</strong> Website Contact Form</p>
                <p><strong>Next Step:</strong> Respond to customer inquiry</p>
            </div>
        </body>
        </html>
        `;
    }

    return `<p>New form submission received at ${timestamp}</p><pre>${JSON.stringify(formData, null, 2)}</pre>`;
}

function formatUserConfirmationEmail(customerData, submissionType) {
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .highlight { background: #fef3f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏠 Thank You for Contacting Lazarus Home Remodeling</h1>
            <p>Your inquiry has been received!</p>
        </div>
        
        <div class="content">
            <p>Dear ${customerData.name || 'Valued Customer'},</p>
            
            <p>Thank you for reaching out to Lazarus Home Remodeling! We've received your ${submissionType} inquiry and are excited to help transform your space.</p>
            
            <div class="highlight">
                <h3>📋 What happens next?</h3>
                <ul>
                    <li><strong>Within 24 hours:</strong> Our team will contact you to discuss your project</li>
                    <li><strong>Free consultation:</strong> We'll schedule an in-home visit at your convenience</li>
                    <li><strong>Custom estimate:</strong> You'll receive a detailed project proposal</li>
                </ul>
            </div>
            
            <h3>Our Services Include:</h3>
            <ul>
                <li>🔧 Kitchen Remodeling</li>
                <li>🛁 Bathroom Remodeling & Walk-in Tubs</li>
                <li>🏠 Whole Home Renovations</li>
                <li>♿ ADA Accessibility Modifications</li>
                <li>🔨 Custom Carpentry & Built-ins</li>
                <li>⚡ Plumbing & Electrical Services</li>
            </ul>
            
            <p><strong>Questions or need immediate assistance?</strong><br>
            Call us directly at <a href="tel:5862488888">(586) 248-8888</a></p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="tel:5862488888" class="button">📞 Call (586) 248-8888</a>
                <a href="https://lazarushomeremodeling.com" class="button">🌐 Visit Our Website</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Lazarus Home Remodeling</strong><br>
            "Revive. Restore. Remarkable."</p>
            <p>📧 Email: robert@lazarushomeremodeling.com | 📞 Phone: (586) 248-8888</p>
            <p><strong>Received:</strong> ${timestamp}</p>
        </div>
    </body>
    </html>
    `;
}

function formatChatBookingAdminEmail(bookingData) {
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #dc2626; }
            .value { margin-left: 10px; }
            .urgent { background: #fef3f2; padding: 15px; border: 2px solid #dc2626; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚨 NEW CHAT CONSULTATION BOOKING</h1>
            <p>Immediate action required</p>
        </div>
        
        <div class="content">
            <div class="urgent">
                <h2>⏰ HIGH PRIORITY LEAD</h2>
                <p><strong>Customer completed booking through AI chat system</strong></p>
                <p>Recommended action: Contact within 2 hours for best conversion rate</p>
            </div>
            
            <h2>Customer Information</h2>
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">${bookingData.name}</span>
            </div>
            <div class="field">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${bookingData.phone}">${bookingData.phone}</a></span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${bookingData.email}">${bookingData.email}</a></span>
            </div>
            
            <h2>Project Details</h2>
            <div class="field">
                <span class="label">Project Type:</span>
                <span class="value">${bookingData.projectType || 'Not specified'}</span>
            </div>
            <div class="field">
                <span class="label">Session ID:</span>
                <span class="value">${bookingData.sessionId || 'N/A'}</span>
            </div>
            
            <h2>Next Steps</h2>
            <ul>
                <li>📞 <strong>Call customer within 2 hours</strong> - (586) 248-8888</li>
                <li>📧 Customer confirmation email sent automatically</li>
                <li>📅 Schedule free in-home consultation</li>
                <li>💼 Prepare project estimate and timeline</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>Received:</strong> ${timestamp}</p>
            <p><strong>Source:</strong> Website AI Chat System</p>
            <p><strong>Action Required:</strong> Contact customer ASAP for optimal conversion</p>
        </div>
    </body>
    </html>
    `;
}

function formatChatBookingUserEmail(bookingData) {
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .confirmation { background: #f0fdf4; padding: 20px; border: 2px solid #22c55e; border-radius: 8px; margin: 20px 0; text-align: center; }
            .details { background: #fef3f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
            .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✅ Consultation Request Confirmed</h1>
            <p>Lazarus Home Remodeling</p>
        </div>
        
        <div class="content">
            <div class="confirmation">
                <h2>🎉 Thank you, ${bookingData.name}!</h2>
                <p><strong>Your consultation request has been received and confirmed.</strong></p>
                <p>Reference ID: ${bookingData.sessionId?.substring(0, 8) || 'LHR' + Date.now()}</p>
            </div>
            
            <div class="details">
                <h3>📋 Your Request Details</h3>
                <p><strong>Project Type:</strong> ${bookingData.projectType || 'Home Remodeling'}</p>
                <p><strong>Contact:</strong> ${bookingData.phone}</p>
                <p><strong>Email:</strong> ${bookingData.email}</p>
                <p><strong>Submitted:</strong> ${timestamp}</p>
            </div>
            
            <h3>🚀 What happens next?</h3>
            <ol>
                <li><strong>Quick Response:</strong> We'll call you within 24 hours to discuss your vision</li>
                <li><strong>Free Consultation:</strong> Schedule an in-home visit at your convenience</li>
                <li><strong>Custom Estimate:</strong> Receive a detailed project proposal with timeline</li>
                <li><strong>Project Kickoff:</strong> Begin your transformation journey with our expert team</li>
            </ol>
            
            <h3>💡 Why Choose Lazarus Home Remodeling?</h3>
            <ul>
                <li>🏆 15+ years of experience in home remodeling</li>
                <li>🔧 Licensed and insured professionals</li>
                <li>🎯 Specialized in kitchen, bathroom, and accessibility remodeling</li>
                <li>⭐ Committed to exceptional craftsmanship and customer satisfaction</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Questions? We're here to help!</strong></p>
                <a href="tel:5862488888" class="button">📞 Call (586) 248-8888</a>
                <a href="https://lazarushomeremodeling.com" class="button">🌐 Visit Website</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Lazarus Home Remodeling</strong><br>
            "Revive. Restore. Remarkable."</p>
            <p>📧 robert@lazarushomeremodeling.com | 📞 (586) 248-8888</p>
            <p>We're excited to help transform your space!</p>
        </div>
    </body>
    </html>
    `;
}

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Serve static files
app.use(express.static('public'));

// Enhanced health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'Lazarus Home Remodeling Backend',
        timestamp: new Date().toISOString(),
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        email: emailTransporter ? 'configured' : 'disabled',
        database: database.isHealthy() ? 'connected' : 'unavailable',
        features: {
            chat_system: true,
            form_processing: true,
            email_notifications: !!emailTransporter,
            user_confirmations: !!emailTransporter,
            database_storage: database.isHealthy(),
            admin_dashboard: true,
            analytics: database.isHealthy()
        }
    });
});

// OpenAI Chat Proxy Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        console.log('🤖 Received chat request:', req.body.message?.substring(0, 100) + '...');
        
        // Validate request
        if (!req.body.message) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            console.log('❌ OpenAI API key not found');
            return res.status(500).json({ 
                error: 'OpenAI API key not configured' 
            });
        }

        // System prompt for Lazarus Home Remodeling
        const systemPrompt = `You are a friendly and knowledgeable customer service representative for Lazarus Home Remodeling. You ONLY discuss home remodeling topics. If someone asks about anything unrelated (like recipes, weather, etc.), politely redirect them back to home remodeling services.

IMPORTANT: When users ask about pricing, estimates, quotes, contractors visiting, or want to discuss their project in detail, guide them toward scheduling a consultation by saying something like "I'd love to help you get an accurate estimate for your project! Let me connect you with our scheduling system to book a free in-home consultation."
        
Our services include:
        - Kitchen Remodeling: $15,000-$50,000 (cabinets, countertops, appliances, lighting)
        - Bathroom Remodeling: $8,000-$25,000 (fixtures, tiling, walk-in tubs, accessibility)
        - Whole Home Remodeling: $30,000-$150,000+ (complete renovations)
        - Room Additions and Basement Finishing: $20,000-$60,000
        - Flooring Installation: $3,000-$15,000 (hardwood, tile, laminate)
        - Custom Carpentry and Built-ins: $2,000-$20,000
        - Plumbing and Electrical Work: $500-$10,000
        - ADA Accessibility Modifications: $3,000-$15,000
        
        Key Information:
        - Contact: (586) 248-8888
        - Free consultations and estimates available
        - Licensed and insured with 15+ years experience
        - Projects typically take 1-12 weeks depending on scope
        - We serve the greater Detroit area
        
        Always be helpful and professional. When users want estimates, quotes, or detailed project discussions, encourage them to book a consultation rather than just providing the phone number. For non-remodeling questions, say something like: "I specialize in home remodeling questions! Let me help you with your renovation needs instead. What home improvement project are you considering?"`;

        // Make request to OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: req.body.message
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        console.log('📡 OpenAI API response status:', openaiResponse.status);

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error('❌ OpenAI API error:', openaiResponse.status, errorText);
            
            // Return a helpful error response
            return res.status(500).json({
                error: 'AI service temporarily unavailable',
                fallback: "I apologize, but I'm having trouble connecting right now. Please call us directly at (586) 248-8888 or use our contact form, and we'll get back to you right away!"
            });
        }

        const data = await openaiResponse.json();
        console.log('✅ OpenAI API success');

        // Return the AI response
        res.json({
            success: true,
            message: data.choices[0].message.content,
            usage: data.usage
        });

    } catch (error) {
        console.error('💥 Backend proxy error:', error);
        
        // Return fallback response
        res.status(500).json({
            error: 'Internal server error',
            fallback: "I apologize, but I'm experiencing technical difficulties. Please call us at (586) 248-8888 or use our contact form for immediate assistance!"
        });
    }
});

// Configuration endpoint (for frontend to check if OpenAI is available)
app.get('/api/config', (req, res) => {
    res.json({
        openaiAvailable: !!process.env.OPENAI_API_KEY,
        chatEnabled: true,
        service: 'Lazarus Home Remodeling'
    });
});

// Analytics and logging endpoints
app.post('/api/chat-events', (req, res) => {
    // Log chat events for analytics
    console.log('📊 Chat Event:', req.body);
    res.json({ success: true });
});

app.post('/api/chat-messages', (req, res) => {
    // Log chat messages for analytics
    console.log('💬 Chat Message:', {
        role: req.body.role,
        timestamp: req.body.timestamp,
        sessionId: req.body.sessionId
    });
    res.json({ success: true });
});

app.post('/api/bookings', async (req, res) => {
    try {
        console.log('📅 New Chat Booking:', req.body);
        
        // Save booking to database
        const bookingResult = await database.saveChatBooking({
            sessionId: req.body.sessionId,
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            projectType: req.body.projectType,
            appointment_preference: req.body.appointment_preference || {}
        });

        if (bookingResult) {
            console.log('✅ Chat booking saved to database:', bookingResult.booking_id);
            
            // Send admin and user notification emails
            const emailResults = await sendChatBookingEmails(req.body);
            
            // Log analytics event
            await database.logAnalyticsEvent({
                session_id: req.body.sessionId,
                customer_id: bookingResult.customer_id,
                event_type: 'booking_completed',
                event_category: 'conversion',
                event_data: {
                    project_type: req.body.projectType,
                    booking_id: bookingResult.booking_id
                }
            });

            res.json({ 
                success: true, 
                message: 'Booking received and processed',
                booking_id: bookingResult.booking_id,
                emails_sent: {
                    admin: emailResults.admin.success,
                    user: emailResults.user.success
                }
            });
        } else {
            // Fallback if database fails
            console.log('⚠️ Database save failed, processing booking without persistence');
            res.json({ success: true, message: 'Booking received (database unavailable)' });
        }
    } catch (error) {
        console.error('❌ Booking processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error processing booking'
        });
    }
});

// Enhanced form submission endpoints
app.post('/api/forms/hero', async (req, res) => {
    try {
        console.log('📝 Received hero form submission:', req.body);
        
        // Validate required fields
        const { name, phone, email } = req.body;
        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name, phone, and email are required'
            });
        }

        // Save to database
        const submissionResult = await database.saveFormSubmission(
            req.body, 
            'hero_form',
            {
                page_url: req.get('Referer'),
                user_agent: req.get('User-Agent'),
                ip_address: req.ip
            }
        );

        // Send admin notification email
        const adminEmailResult = await sendFormEmail(req.body, 'Hero Multi-Step');
        
        // Send user confirmation email
        let userEmailResult = { success: false };
        if (email) {
            userEmailResult = await sendUserConfirmationEmail(
                { name, email, phone }, 
                'hero form'
            );
        }

        // Log analytics event
        if (submissionResult) {
            await database.logAnalyticsEvent({
                customer_id: submissionResult.customer_id,
                event_type: 'form_submitted',
                event_category: 'engagement',
                event_data: {
                    form_type: 'hero_form',
                    services: req.body.services,
                    submission_id: submissionResult.submission_id
                },
                page_url: req.get('Referer'),
                user_agent: req.get('User-Agent'),
                ip_address: req.ip
            });
        }
        
        console.log('✅ Hero form processed:', {
            database: !!submissionResult,
            admin_email: adminEmailResult.success,
            user_email: userEmailResult.success
        });

        res.json({
            success: true,
            message: 'Form submitted successfully',
            submission_id: submissionResult?.submission_id,
            emails_sent: {
                admin: adminEmailResult.success,
                user_confirmation: userEmailResult.success
            }
        });

    } catch (error) {
        console.error('❌ Hero form submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error processing form'
        });
    }
});

app.post('/api/forms/contact', async (req, res) => {
    try {
        console.log('📞 Received contact form submission:', req.body);
        
        // Validate required fields
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and message are required'
            });
        }

        // Save to database
        const submissionResult = await database.saveFormSubmission(
            req.body, 
            'contact_form',
            {
                page_url: req.get('Referer'),
                user_agent: req.get('User-Agent'),
                ip_address: req.ip
            }
        );

        // Send admin notification email
        const adminEmailResult = await sendFormEmail(req.body, 'Contact');
        
        // Send user confirmation email
        const userEmailResult = await sendUserConfirmationEmail(
            { name, email, phone: req.body.phone }, 
            'contact form'
        );

        // Log analytics event
        if (submissionResult) {
            await database.logAnalyticsEvent({
                customer_id: submissionResult.customer_id,
                event_type: 'form_submitted',
                event_category: 'engagement',
                event_data: {
                    form_type: 'contact_form',
                    submission_id: submissionResult.submission_id
                },
                page_url: req.get('Referer'),
                user_agent: req.get('User-Agent'),
                ip_address: req.ip
            });
        }
        
        console.log('✅ Contact form processed:', {
            database: !!submissionResult,
            admin_email: adminEmailResult.success,
            user_email: userEmailResult.success
        });

        res.json({
            success: true,
            message: 'Message sent successfully',
            submission_id: submissionResult?.submission_id,
            emails_sent: {
                admin: adminEmailResult.success,
                user_confirmation: userEmailResult.success
            }
        });

    } catch (error) {
        console.error('❌ Contact form submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error processing message'
        });
    }
});

// Enhanced admin dashboard API endpoints
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const stats = await database.getDashboardStats();
        const recentBookings = await database.getRecentBookings(20);
        
        res.json({
            success: true,
            stats: stats || {
                today_conversations: 0,
                today_bookings: 0,
                today_forms: 0,
                today_customers: 0,
                total_conversions: 0,
                total_conversations: 0,
                avg_session_duration: 0
            },
            recent_bookings: recentBookings
        });
    } catch (error) {
        console.error('❌ Dashboard API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard data'
        });
    }
});

app.get('/api/admin/conversations', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const conversations = await database.getConversationHistory(limit);
        
        res.json({
            success: true,
            conversations: conversations || []
        });
    } catch (error) {
        console.error('❌ Conversations API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load conversation history'
        });
    }
});

app.get('/api/admin/customers', async (req, res) => {
    try {
        const result = await database.query(`
            SELECT 
                customer_id,
                first_name || ' ' || COALESCE(last_name, '') as full_name,
                email,
                phone_primary,
                lead_source,
                lead_status,
                created_at,
                (SELECT COUNT(*) FROM chat_sessions WHERE customer_id = customers.customer_id) as chat_sessions,
                (SELECT COUNT(*) FROM chat_bookings WHERE customer_id = customers.customer_id) as bookings,
                (SELECT COUNT(*) FROM projects WHERE customer_id = customers.customer_id) as projects
            FROM customers 
            ORDER BY created_at DESC 
            LIMIT 100;
        `);
        
        res.json({
            success: true,
            customers: result?.rows || []
        });
    } catch (error) {
        console.error('❌ Customers API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load customer data'
        });
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        
        const result = await database.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) FILTER (WHERE event_type = 'chat_opened') as chats_opened,
                COUNT(*) FILTER (WHERE event_type = 'form_submitted') as forms_submitted,
                COUNT(*) FILTER (WHERE event_type = 'booking_completed') as bookings_completed,
                COUNT(DISTINCT customer_id) as unique_customers
            FROM analytics_events 
            WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC;
        `);
        
        res.json({
            success: true,
            analytics: result?.rows || []
        });
    } catch (error) {
        console.error('❌ Analytics API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load analytics data'
        });
    }
});

// Catch-all handler for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏠 Lazarus Home Remodeling Backend Server`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🤖 OpenAI Integration: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing API Key'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;