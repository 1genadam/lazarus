// Lazarus Home Remodeling Chat System
// Integrates with OpenAI GPT for customer support

class LazarusChatWidget {
    constructor() {
        this.backendAvailable = false; // Will be checked during initialization
        this.useBackendProxy = true; // Use backend proxy instead of direct OpenAI calls
        this.messages = [];
        this.isLoading = false;
        this.bookingFlow = {
            active: false,
            step: 0, // 0: not started, 1: name, 2: phone, 3: email, 4: appointment type, 5: confirmation
            data: {}
        };
        this.sessionId = this.generateSessionId();
        this.autoReopenDelay = 2 * 60 * 1000; // 2 minutes in milliseconds
        
        // Load chat state from localStorage to persist across page navigation
        this.loadChatState();
        this.conversationLog = {
            sessionId: this.sessionId,
            startTime: new Date().toISOString(),
            messages: [],
            bookingAttempts: [],
            completedBooking: null,
            userInfo: {},
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        };
        this.systemPrompt = `You are a helpful, witty, and knowledgeable customer service representative for Lazarus Home Remodeling. Your PRIMARY GOAL is to schedule consultations and appointments while being genuinely helpful about home remodeling topics. You ONLY discuss home remodeling topics. If someone asks about anything unrelated, politely redirect them back to home remodeling services with a touch of humor.

Our services include:
        - Kitchen Remodeling (cabinets, countertops, appliances, lighting, islands, backsplashes)
        - Bathroom Remodeling (fixtures, tiling, walk-in tubs, showers, vanities, accessibility features)
        - Walk-in Tub Installation (safe, accessible bathing solutions)
        - ADA Accessibility Modifications (barrier-free design, safety features)
        - Room Additions (expanding your living space)
        - Basement Finishing (converting basements into livable spaces)
        - Flooring Installation (hardwood, tile, laminate, luxury vinyl)
        - Plumbing Services (installation, repairs, upgrades)
        - Electrical Work (wiring, fixtures, electrical upgrades)
        - Interior Renovations (living rooms, bedrooms, dining areas)
        - Custom Carpentry (built-ins, cabinets, trim work)
        - General Home Improvements (repairs, updates, enhancements)
        - Design Services (professional design expertise for any style or time period)

        Key Information:
        - Contact: (586) 248-8888
        - Free consultations and estimates available
        - We serve the greater Detroit area
        
        IMPORTANT: Always try to guide conversations toward scheduling a consultation. Use phrases like "Would you like to schedule a free consultation?", "Let's set up a time to discuss your project", "I can help you book an appointment", or "Our team would love to see your space and give you ideas."
        
        Be professional but personable, knowledgeable but not overwhelming, and always helpful while steering toward appointment booking. For off-topic questions, redirect with humor: "I'm great with home renovations, but my recipe knowledge is about as reliable as a wobbly cabinet door! Let's talk about upgrading your space instead - what room are you looking to transform?"`;
        this.init();
    }

    generateSessionId() {
        return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    loadChatState() {
        try {
            const savedState = localStorage.getItem('lazarusChatState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.chatClosedByUser = state.chatClosedByUser || false;
                this.chatCloseTime = state.chatCloseTime || null;
                
                // Check if the saved close time is still within the delay period
                if (this.chatClosedByUser && this.chatCloseTime) {
                    const timeSinceClose = Date.now() - this.chatCloseTime;
                    if (timeSinceClose >= this.autoReopenDelay) {
                        // Reset if delay period has passed
                        this.chatClosedByUser = false;
                        this.chatCloseTime = null;
                        this.saveChatState();
                        console.log('✅ Chat state reset - 2 minutes have passed since last close');
                    } else {
                        const remainingTime = Math.ceil((this.autoReopenDelay - timeSinceClose) / 1000);
                        console.log(`⏳ Chat state loaded - auto-open disabled for ${remainingTime}s more`);
                    }
                }
            } else {
                // First visit - initialize state
                this.chatClosedByUser = false;
                this.chatCloseTime = null;
            }
        } catch (error) {
            console.warn('Could not load chat state from localStorage:', error);
            this.chatClosedByUser = false;
            this.chatCloseTime = null;
        }
    }

    saveChatState() {
        try {
            const state = {
                chatClosedByUser: this.chatClosedByUser,
                chatCloseTime: this.chatCloseTime,
                lastSaved: Date.now()
            };
            localStorage.setItem('lazarusChatState', JSON.stringify(state));
            console.log('💾 Chat state saved to localStorage');
        } catch (error) {
            console.warn('Could not save chat state to localStorage:', error);
        }
    }

    // Integration with analytics tracker
    logToAnalytics(userMessage, botResponse, step = null) {
        if (window.analyticsTracker) {
            window.analyticsTracker.trackChatMessage(userMessage, botResponse, step);
        }
    }

    async init() {
        this.bindEvents();
        this.addWelcomeMessage();
        
        // Load API configuration from backend
        try {
            await this.loadConfig();
        } catch (error) {
            console.log('Chat functionality running in demo mode');
        }

        // Start session tracking
        try {
            this.logEvent('chat_session_started', { sessionId: this.sessionId });
        } catch (error) {
            console.warn('Could not log session start:', error);
        }
    }

    async loadConfig() {
        // Check if backend proxy is available
        try {
            console.log('🔍 Checking backend availability...');
            const response = await fetch('/api/config');
            if (response.ok) {
                const config = await response.json();
                this.backendAvailable = config.openaiAvailable;
                console.log('✅ Backend proxy available:', this.backendAvailable);
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            console.log('❌ Backend proxy not available, using demo mode:', error.message);
            this.backendAvailable = false;
        }
    }

    bindEvents() {
        const chatButton = document.getElementById('chat-widget-button');
        const chatWidget = document.getElementById('chat-widget');
        const closeButton = document.getElementById('close-chat-widget');
        const messageInput = document.querySelector('#chat-widget input');
        const sendButton = document.querySelector('#chat-widget button[type="button"]');

        console.log('Binding chat events...', { chatButton, chatWidget, closeButton });

        if (chatButton && chatWidget) {
            chatButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Chat button clicked!');
                const wasHidden = chatWidget.classList.contains('hidden');
                chatWidget.classList.toggle('hidden');
                
                if (wasHidden) {
                    // User manually opened chat - reset any close tracking
                    this.chatClosedByUser = false;
                    this.chatCloseTime = null;
                    this.saveChatState();
                    console.log('✅ User manually opened chat - auto-open re-enabled');
                    
                    this.logEvent('chat_opened', { trigger: 'button_click' });
                    messageInput?.focus();
                } else {
                    // User manually closed chat via button - track this
                    this.chatClosedByUser = true;
                    this.chatCloseTime = Date.now();
                    this.saveChatState();
                    console.log('🚫 User manually closed chat via button - auto-reopen disabled for 2 minutes');
                    
                    this.logEvent('chat_closed', { 
                        trigger: 'button_click',
                        userClosed: true,
                        closeTime: this.chatCloseTime
                    });
                }
            });
        }

        if (closeButton && chatWidget) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                chatWidget.classList.add('hidden');
                
                // Track that user manually closed chat
                this.chatClosedByUser = true;
                this.chatCloseTime = Date.now();
                this.saveChatState();
                console.log('🚫 User manually closed chat - auto-reopen disabled for 2 minutes');
                
                this.logEvent('chat_closed', { 
                    trigger: 'close_button',
                    userClosed: true,
                    closeTime: this.chatCloseTime
                });
            });
        }

        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sendMessage();
            });
        }

        // Auto-open chat widget on page load after ensuring DOM is ready
        const attemptAutoOpen = () => {
            const widget = document.getElementById('chat-widget');
            const input = document.querySelector('#chat-widget input');
            console.log('🚀 Attempting auto-open...', { widget: !!widget, input: !!input });
            
            if (widget && !widget.classList.contains('hidden')) {
                console.log('✅ Chat already open, skipping auto-open');
                return;
            }
            
            // Check if user recently closed the chat
            if (this.chatClosedByUser && this.chatCloseTime) {
                const timeSinceClose = Date.now() - this.chatCloseTime;
                if (timeSinceClose < this.autoReopenDelay) {
                    const remainingTime = Math.ceil((this.autoReopenDelay - timeSinceClose) / 1000);
                    console.log(`⏳ Auto-open disabled - user closed chat ${Math.ceil(timeSinceClose/1000)}s ago. Will re-enable in ${remainingTime}s`);
                    return;
                } else {
                    // Reset the flag after 2 minutes have passed
                    this.chatClosedByUser = false;
                    this.chatCloseTime = null;
                    this.saveChatState();
                    console.log('✅ Auto-open re-enabled - 2 minutes have passed since user closed chat');
                }
            }
            
            if (widget) {
                console.log('🚀 Auto-opening chat widget...');
                widget.classList.remove('hidden');
                input?.focus();
                this.logEvent('chat_opened', { trigger: 'auto_open' });
                console.log('✅ Auto-open completed successfully!');
            } else {
                console.log('❌ Chat widget not found for auto-open');
            }
        };

        // Try auto-open with multiple timing strategies
        setTimeout(attemptAutoOpen, 1000);  // Try after 1 second
        setTimeout(attemptAutoOpen, 3000);  // Fallback after 3 seconds
        
        // Periodic check to re-enable auto-open after delay period
        setInterval(() => {
            if (this.chatClosedByUser && this.chatCloseTime) {
                const timeSinceClose = Date.now() - this.chatCloseTime;
                if (timeSinceClose >= this.autoReopenDelay) {
                    this.chatClosedByUser = false;
                    this.chatCloseTime = null;
                    this.saveChatState();
                    console.log('✅ Auto-open re-enabled after 2-minute delay');
                    
                    // Attempt auto-open now that delay has passed
                    const widget = document.getElementById('chat-widget');
                    if (widget && widget.classList.contains('hidden')) {
                        console.log('🚀 Attempting delayed auto-reopen...');
                        attemptAutoOpen();
                    }
                }
            }
        }, 30000); // Check every 30 seconds

        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            this.logEvent('chat_session_ended', {
                duration: Date.now() - new Date(this.conversationLog.startTime).getTime(),
                messageCount: this.messages.length,
                bookingCompleted: !!this.conversationLog.completedBooking
            });
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'assistant',
            content: "Hello! I'm here to help you with your home remodeling project. I can answer questions about our services, help you plan your renovation, or schedule a consultation. How can I assist you today?"
        };
        
        this.messages.push(welcomeMessage);
        this.updateChatDisplay();
    }

    logEvent(eventType, data = {}) {
        const eventData = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            eventType: eventType,
            ...data
        };
        
        console.log('Chat Event:', eventData);
        
        // Send to backend reporting endpoint
        this.sendToBackend('/api/chat-events', eventData);
    }

    logMessage(role, content, metadata = {}) {
        const messageData = {
            timestamp: new Date().toISOString(),
            role: role,
            content: content,
            sessionId: this.sessionId,
            ...metadata
        };
        
        this.conversationLog.messages.push(messageData);
        
        // Send conversation update to backend
        this.sendToBackend('/api/chat-messages', messageData);
    }

    async sendToBackend(endpoint, data) {
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            // Fallback: store in localStorage for later sync
            const storedChats = JSON.parse(localStorage.getItem('chatLogs') || '[]');
            storedChats.push({ endpoint, data, timestamp: new Date().toISOString() });
            localStorage.setItem('chatLogs', JSON.stringify(storedChats.slice(-100))); // Keep last 100 entries
        }
    }

    async sendMessage() {
        const messageInput = document.querySelector('#chat-widget input');
        if (!messageInput || this.isLoading) return;

        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        // Log user message
        this.logMessage('user', userMessage);
        
        // Log to analytics tracker
        this.logToAnalytics(userMessage, null, this.bookingFlow.step);

        // Add user message
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        messageInput.value = '';
        this.updateChatDisplay();

        // Show loading indicator
        this.isLoading = true;
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(userMessage);
            
            // Log assistant response
            this.logMessage('assistant', response, {
                aiUsed: this.apiKey ? 'openai' : 'demo',
                bookingFlowActive: this.bookingFlow.active,
                bookingStep: this.bookingFlow.step
            });
            
            // Log to analytics tracker
            this.logToAnalytics(userMessage, response, this.bookingFlow.step);
            
            this.messages.push({
                role: 'assistant',
                content: response
            });
        } catch (error) {
            console.error('Chat error:', error);
            const errorResponse = "I apologize, but I'm having trouble connecting right now. Please call us directly at (586) 248-8888 or use our contact form, and we'll get back to you right away!";
            
            this.logMessage('assistant', errorResponse, { error: error.message });
            this.logEvent('chat_error', { error: error.message });
            
            this.messages.push({
                role: 'assistant',
                content: errorResponse
            });
        } finally {
            this.isLoading = false;
            this.hideTypingIndicator();
            this.updateChatDisplay();
        }
    }

    async getAIResponse(userMessage) {
        // Check for booking intent first (before AI or demo responses)
        const message = userMessage.toLowerCase();
        
        // Enhanced booking intent detection
        if (message.includes('contractor') || message.includes('come out') || message.includes('visit') ||
            message.includes('book') || message.includes('schedule') || message.includes('appointment') || 
            message.includes('consultation') || message.includes('estimate') || message.includes('quote') ||
            message.includes('call') || message.includes('contact') || message.includes('speak with') ||
            message.includes('meet') || message.includes('pricing') || message.includes('cost')) {
            return this.startBookingFlow();
        }

        // Check if we're in booking flow
        if (this.bookingFlow.active) {
            return this.handleBookingFlow(userMessage);
        }
        
        // Try backend proxy first if available
        if (this.backendAvailable) {
            console.log('🤖 Using backend proxy for OpenAI...');
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                });

                console.log('📡 Backend proxy response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.message) {
                        console.log('✅ Backend proxy success:', data.message.substring(0, 100) + '...');
                        
                        // Check if AI response should trigger booking flow
                        const aiResponse = data.message.toLowerCase();
                        if (aiResponse.includes('contact us') || aiResponse.includes('call us') || 
                            aiResponse.includes('(586) 248-8888') || aiResponse.includes('schedule')) {
                            return this.startBookingFlow();
                        }
                        
                        return data.message;
                    } else if (data.fallback) {
                        console.log('⚠️ Backend returned fallback response');
                        return data.fallback;
                    }
                } else {
                    const errorData = await response.json();
                    console.error('❌ Backend proxy error:', response.status, errorData);
                    if (errorData.fallback) {
                        return errorData.fallback;
                    }
                }
            } catch (error) {
                console.error('💥 Backend proxy network error:', error);
                // Fall back to demo responses
            }
        } else {
            console.log('🔑 Backend not available, using demo responses');
        }

        // Enhanced demo responses for common home remodeling questions (fallback)
        const demoResponses = {
            kitchen: "Great choice! Kitchen remodeling is one of our specialties. We handle everything from cabinet installation and countertops to plumbing and electrical work. Kitchen projects typically range from $15,000-$50,000 and take 2-4 weeks depending on scope. Would you like to schedule a free consultation to discuss your vision?",
            
            bathroom: "Bathroom remodeling can really transform your daily routine! We specialize in both full renovations and smaller updates. Popular options include walk-in tubs, walk-in showers, new vanities, tile work, and accessibility modifications. Bathroom projects typically range from $8,000-$25,000. What specific changes are you considering?",
            
            walkin: "Our walk-in tubs are perfect for safe, accessible bathing! We offer two models: the Seed (52\"×30\") for compact bathrooms and the Sprout (60\"×30\") for extra comfort. Both feature 21\" wide seats, low 4\" threshold entry, and therapeutic systems including hydrotherapy, air massage, and independent foot massage. They're ADA-compliant and perfect for users up to 400+ lbs. Would you like to learn more about which model suits your space?",
            
            tub: "Walk-in tubs are one of our specialties! Our premium models feature therapeutic systems, safety features like grab bars and non-slip flooring, and fast 80-second drainage. Perfect for aging-in-place, mobility issues, arthritis, diabetes, and neuropathy relief. Both models accommodate users comfortably with 21\" wide seating. What's your bathroom size and any specific health needs?",
            
            weight: "Great question! Both our Seed and Sprout walk-in tub models easily accommodate users up to 400+ pounds with their 21\" wide seats. The sturdy construction and ADA-compliant grab bars provide excellent support. For a 200 lb user, either model will be very comfortable. The main difference is the Seed (52\") fits smaller bathrooms while the Sprout (60\") offers extra legroom. What's your bathroom size?",
            
            ada: "Absolutely! Our walk-in tubs are fully ADA-compliant with low 4\" threshold entry, ADA-compliant grab bars, 17\" seat height for easy wheelchair transfers, non-slip textured flooring, and 21\" wide seating. Perfect for wheelchair users, walker/cane users, and anyone with limited mobility. Both models meet all accessibility standards for aging-in-place solutions.",
            
            small: "For small bathrooms, our Seed model (52\"×30\") is perfect! It's specifically designed for compact spaces while still providing all the safety and therapeutic features. The 21\" wide seat comfortably accommodates most users, and the 75-gallon capacity fills in 7-10 minutes. Would you like me to help you schedule a consultation to measure your space?",
            
            health: "Our walk-in tubs provide therapeutic benefits for many conditions including arthritis, diabetes-related circulation issues, neuropathy, fibromyalgia, muscle tension, joint pain, and mobility challenges. The hydrotherapy jets, air massage, and independent foot massage systems can help improve circulation and reduce pain. Always consult your doctor, but many users find significant relief. What specific condition are you dealing with?",
            
            price: "Our pricing varies based on project scope, materials, and timeline. Here are typical ranges: Kitchen remodels $15,000-$50,000, Bathroom renovations $8,000-$25,000, Whole home projects $30,000-$150,000+, Flooring $3,000-$15,000. We offer free in-home consultations for accurate estimates. Would you like to schedule one?",
            
            cost: "Here are our typical cost ranges: Kitchen remodeling $15,000-$50,000, Bathroom remodeling $8,000-$25,000, Room additions $20,000-$60,000, Flooring installation $3,000-$15,000, Custom carpentry $2,000-$20,000. Every project is unique, so we offer free consultations for precise estimates. Call (586) 248-8888 to schedule!",
            
            budget: "We work with various budgets! Our projects typically range from small updates ($2,000+) to whole home renovations ($150,000+). During our free consultation, we'll discuss your budget and show you options that work within it. What's your approximate budget range?",
            
            timeline: "Project timelines depend on scope: Bathroom renovations 1-2 weeks, Kitchen remodels 2-4 weeks, Room additions 4-8 weeks, Whole home projects 8-12+ weeks. We provide detailed timelines during consultation. What type of project are you planning?",
            
            consultation: "Absolutely! We offer free consultations where we visit your home, discuss your vision, take measurements, and provide detailed estimates. Our team can usually schedule within 2-3 days. Call (586) 248-8888 or use our contact form. Would you prefer morning or afternoon?",
            
            experience: "We're licensed and insured with over 15 years of experience in the Detroit area. We specialize in quality craftsmanship and customer satisfaction. All our work comes with warranties and we maintain an A+ rating with the Better Business Bureau.",
            
            area: "We serve the greater Detroit metropolitan area including surrounding suburbs. During our free consultation, we'll confirm we service your specific location and discuss any travel considerations.",
            
            unrelated: "I specialize in home remodeling questions! Let me help you with your renovation needs instead. Are you considering a kitchen remodel, bathroom renovation, or another home improvement project? I'd be happy to discuss our services and pricing!"
        };

        // Enhanced keyword matching for demo
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for non-remodeling topics first
        if (lowerMessage.includes('recipe') || lowerMessage.includes('food') || lowerMessage.includes('cook') || 
            lowerMessage.includes('dinner') || lowerMessage.includes('burger') || lowerMessage.includes('meal') ||
            lowerMessage.includes('weather') || lowerMessage.includes('sports') || lowerMessage.includes('movie') ||
            lowerMessage.includes('music') || lowerMessage.includes('forget') || lowerMessage.includes('train')) {
            return demoResponses.unrelated;
        }
        
        // Build to suit and custom questions
        if (lowerMessage.includes('build to suit') || lowerMessage.includes('custom build') || lowerMessage.includes('custom design')) {
            return "Absolutely! We specialize in build-to-suit and custom design projects. Whether you need a completely custom kitchen layout, unique built-in storage solutions, or a one-of-a-kind bathroom design, we work closely with you to create spaces that perfectly match your vision and lifestyle. Our design team will collaborate with you from concept to completion. What kind of custom project are you envisioning?";
        }
        
        if (lowerMessage.includes('do you') || lowerMessage.includes('can you')) {
            if (lowerMessage.includes('kitchen') || lowerMessage.includes('bathroom') || lowerMessage.includes('remodel') || 
                lowerMessage.includes('renovation') || lowerMessage.includes('design') || lowerMessage.includes('build')) {
                return "Yes! We handle all aspects of home remodeling including kitchen and bathroom renovations, whole home remodels, custom carpentry, flooring installation, plumbing, electrical work, and accessibility modifications. We're licensed, insured, and have 15+ years of experience. What specific project are you considering?";
            }
        }
        
        // Home remodeling topics
        if (lowerMessage.includes('kitchen')) return demoResponses.kitchen;
        if (lowerMessage.includes('bathroom') && !lowerMessage.includes('walk') && !lowerMessage.includes('tub')) return demoResponses.bathroom;
        if (lowerMessage.includes('walk-in') || lowerMessage.includes('walkin') || (lowerMessage.includes('walk') && lowerMessage.includes('tub'))) return demoResponses.walkin;
        if (lowerMessage.includes('tub') && !lowerMessage.includes('hot')) return demoResponses.tub;
        if (lowerMessage.includes('weight') || lowerMessage.includes('pounds') || lowerMessage.includes('lbs') || lowerMessage.includes('heavy')) return demoResponses.weight;
        if (lowerMessage.includes('ada') || lowerMessage.includes('accessible') || lowerMessage.includes('wheelchair') || lowerMessage.includes('disability')) return demoResponses.ada;
        if (lowerMessage.includes('small') || lowerMessage.includes('compact') || lowerMessage.includes('tight') || lowerMessage.includes('little')) return demoResponses.small;
        if (lowerMessage.includes('arthritis') || lowerMessage.includes('diabetes') || lowerMessage.includes('neuropathy') || lowerMessage.includes('pain') || lowerMessage.includes('circulation') || lowerMessage.includes('mobility')) return demoResponses.health;
        if (lowerMessage.includes('much') || lowerMessage.includes('cost')) return demoResponses.cost;
        if (lowerMessage.includes('price') || lowerMessage.includes('pricing')) return demoResponses.price;
        if (lowerMessage.includes('budget')) return demoResponses.budget;
        if (lowerMessage.includes('time') || lowerMessage.includes('long') || lowerMessage.includes('when') || lowerMessage.includes('timeline')) return demoResponses.timeline;
        if (lowerMessage.includes('consultation') || lowerMessage.includes('estimate') || lowerMessage.includes('quote') || lowerMessage.includes('appointment')) return demoResponses.consultation;
        if (lowerMessage.includes('experience') || lowerMessage.includes('licensed') || lowerMessage.includes('insured')) return demoResponses.experience;
        if (lowerMessage.includes('area') || lowerMessage.includes('location') || lowerMessage.includes('detroit')) return demoResponses.area;
        if (lowerMessage.includes('floor') || lowerMessage.includes('flooring')) return "We install all types of flooring including hardwood, tile, laminate, and luxury vinyl. Flooring projects typically range from $3,000-$15,000 depending on materials and square footage. What type of flooring are you considering?";
        if (lowerMessage.includes('whole home') || lowerMessage.includes('entire') || lowerMessage.includes('complete')) return "Whole home remodeling is our specialty! These comprehensive projects typically range from $30,000-$150,000+ and take 8-12+ weeks. We handle everything from design to completion. What areas of your home are you looking to renovate?";


        // Default response for general remodeling questions
        return "Thanks for your question! I'm here to help with your home remodeling needs. We specialize in kitchen and bathroom remodeling, whole home renovations, flooring, and accessibility modifications. Our projects typically range from $2,000 for small updates to $150,000+ for complete home transformations. What specific project are you considering? Call (586) 248-8888 or say 'book appointment' for a free consultation!";
    }

    showTypingIndicator() {
        const chatMessages = document.querySelector('#chat-widget .overflow-y-auto');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'flex mb-4 typing-indicator';
        typingDiv.innerHTML = `
            <div class="bg-gray-200 p-3 rounded-lg max-w-xs">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    startBookingFlow() {
        this.bookingFlow.active = true;
        this.bookingFlow.step = 1;
        this.bookingFlow.data = {};
        return "Great! I'll help you schedule a free consultation. Let's start with your name - what should I call you?";
    }

    handleBookingFlow(userMessage) {
        const message = userMessage.trim();
        
        switch (this.bookingFlow.step) {
            case 1: // Collecting name
                if (message.length < 2) {
                    return "Please enter your full name so we can personalize your consultation.";
                }
                this.bookingFlow.data.name = message;
                this.bookingFlow.step = 2;
                return `Nice to meet you, ${message}! Now I need your phone number so we can call to confirm your appointment.`;
                
            case 2: // Collecting phone
                const phoneRegex = /(?:\+?1[-. ]?)?(?:\(?[0-9]{3}\)?[-. ]?)?[0-9]{3}[-. ]?[0-9]{4}/;
                if (!phoneRegex.test(message)) {
                    return "Please enter a valid phone number (e.g., (586) 248-8888 or 586-248-8888).";
                }
                this.bookingFlow.data.phone = message;
                this.bookingFlow.step = 3;
                return "Perfect! What's your email address? We'll send you a confirmation and any prep materials.";
                
            case 3: // Collecting email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(message)) {
                    return "Please enter a valid email address (e.g., yourname@email.com).";
                }
                this.bookingFlow.data.email = message;
                this.bookingFlow.step = 4;
                return "Excellent! What type of consultation are you interested in?\n\n1. Kitchen Remodeling\n2. Bathroom Remodeling\n3. Whole Home Renovation\n4. Room Addition\n5. Flooring\n6. Other/Multiple Projects\n\nJust reply with the number or tell me what project you're considering.";
                
            case 4: // Collecting project type
                let projectType = "";
                const lowerMessage = message.toLowerCase();
                
                if (message === "1" || lowerMessage.includes("kitchen")) {
                    projectType = "Kitchen Remodeling";
                } else if (message === "2" || lowerMessage.includes("bathroom")) {
                    projectType = "Bathroom Remodeling";
                } else if (message === "3" || lowerMessage.includes("whole") || lowerMessage.includes("home")) {
                    projectType = "Whole Home Renovation";
                } else if (message === "4" || lowerMessage.includes("addition") || lowerMessage.includes("room")) {
                    projectType = "Room Addition";
                } else if (message === "5" || lowerMessage.includes("floor")) {
                    projectType = "Flooring";
                } else if (message === "6" || lowerMessage.includes("other") || lowerMessage.includes("multiple")) {
                    projectType = "Multiple Projects";
                } else {
                    projectType = message;
                }
                
                this.bookingFlow.data.projectType = projectType;
                this.bookingFlow.step = 5;
                return this.completeBooking();
                
            default:
                this.bookingFlow.active = false;
                return "Something went wrong with the booking process. Let's start over - would you like to schedule a consultation?";
        }
    }

    completeBooking() {
        const { name, phone, email, projectType } = this.bookingFlow.data;
        
        // Enhanced booking data with session info
        const completedBooking = {
            ...this.bookingFlow.data,
            sessionId: this.sessionId,
            completedAt: new Date().toISOString(),
            source: 'website_chat',
            pageUrl: window.location.href,
            conversationLength: this.messages.length,
            timeSpent: Date.now() - new Date(this.conversationLog.startTime).getTime()
        };
        
        // Store completed booking
        this.conversationLog.completedBooking = completedBooking;
        this.conversationLog.userInfo = { name, phone, email };
        
        // Log the completed booking
        this.logEvent('booking_completed', completedBooking);
        
        // Send to CRM/Database
        this.sendToBackend('/api/bookings', completedBooking);
        
        // Send email notification
        this.sendToBackend('/api/notifications/new-booking', {
            type: 'new_booking',
            booking: completedBooking,
            subject: `New Consultation Request from ${name}`,
            priority: 'high'
        });
        
        // Reset booking flow
        this.bookingFlow.active = false;
        this.bookingFlow.step = 0;
        
        console.log('Booking completed:', completedBooking);
        
        return `Perfect! Here's your consultation request:\n\n` +
               `📋 **Consultation Details**\n` +
               `Name: ${name}\n` +
               `Phone: ${phone}\n` +
               `Email: ${email}\n` +
               `Project: ${projectType}\n\n` +
               `✅ **Next Steps:**\n` +
               `1. We'll call you within 24 hours to schedule your free consultation\n` +
               `2. Our team will visit your home at your convenience\n` +
               `3. You'll receive a detailed estimate and project timeline\n\n` +
               `**Questions?** Call us directly at (586) 248-8888\n\n` +
               `Thank you for choosing Lazarus Home Remodeling! We're excited to help transform your space. 🏠✨`;
    }

    updateChatDisplay() {
        const chatMessages = document.querySelector('#chat-widget .overflow-y-auto');
        if (!chatMessages) return;

        // Clear existing messages (except welcome)
        chatMessages.innerHTML = '';

        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = message.role === 'user' ? 'flex justify-end mb-4' : 'flex mb-4';
            
            const messageContent = document.createElement('div');
            messageContent.className = message.role === 'user' 
                ? 'bg-yellow-400 text-red-800 p-3 rounded-lg max-w-xs'
                : 'bg-gray-200 p-3 rounded-lg max-w-xs';
            
            // Handle markdown-style formatting
            const formattedContent = message.content
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            
            messageContent.innerHTML = `<p class="text-sm">${formattedContent}</p>`;
            messageDiv.appendChild(messageContent);
            chatMessages.appendChild(messageDiv);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat...');
    window.lazarusChat = new LazarusChatWidget();
});

// Also initialize on window load as fallback
window.addEventListener('load', () => {
    if (!window.lazarusChat) {
        console.log('Window loaded, initializing chat as fallback...');
        window.lazarusChat = new LazarusChatWidget();
    }
});

// Export for use in other contexts
window.LazarusChatWidget = LazarusChatWidget;