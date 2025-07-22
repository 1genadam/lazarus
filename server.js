// Lazarus Home Remodeling Backend Server
// Provides OpenAI API proxy to avoid CORS issues

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

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

// Email service functions
async function sendFormEmail(formData, formType) {
    if (!emailTransporter) {
        console.log('📧 Email service not available - form data logged locally');
        console.log(`${formType} Form Submission:`, formData);
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const emailSubject = `New ${formType} Inquiry - Lazarus Home Remodeling`;
        const emailBody = formatFormEmail(formData, formType);

        const mailOptions = {
            from: emailConfig.from,
            to: 'robert@lazarushomeremodeling.com',
            subject: emailSubject,
            html: emailBody,
            text: stripHtml(emailBody)
        };

        const result = await emailTransporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
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

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: 'Lazarus Home Remodeling Backend',
        timestamp: new Date().toISOString(),
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        email: emailTransporter ? 'configured' : 'disabled'
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

app.post('/api/bookings', (req, res) => {
    // Handle booking submissions
    console.log('📅 New Booking:', req.body);
    // In production, this would save to database and send notifications
    res.json({ success: true, message: 'Booking received' });
});

// Form submission endpoints
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

        // Send email notification
        const emailResult = await sendFormEmail(req.body, 'Hero Multi-Step');
        
        if (emailResult.success) {
            console.log('✅ Hero form email sent successfully');
            res.json({
                success: true,
                message: 'Form submitted and email sent successfully',
                messageId: emailResult.messageId
            });
        } else {
            console.log('⚠️ Hero form submitted but email failed:', emailResult.error);
            res.json({
                success: true,
                message: 'Form submitted successfully (email notification pending)',
                emailError: emailResult.error
            });
        }
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

        // Send email notification
        const emailResult = await sendFormEmail(req.body, 'Contact');
        
        if (emailResult.success) {
            console.log('✅ Contact form email sent successfully');
            res.json({
                success: true,
                message: 'Message sent successfully',
                messageId: emailResult.messageId
            });
        } else {
            console.log('⚠️ Contact form submitted but email failed:', emailResult.error);
            res.json({
                success: true,
                message: 'Message submitted successfully (email notification pending)',
                emailError: emailResult.error
            });
        }
    } catch (error) {
        console.error('❌ Contact form submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error processing message'
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