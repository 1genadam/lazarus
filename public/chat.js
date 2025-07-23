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
        this.pageLoadTime = Date.now(); // Track when chat widget was initialized
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
        this.systemPrompt = `You are a friendly and knowledgeable customer service representative for Lazarus Home Remodeling. You ONLY discuss home remodeling topics. If someone asks about anything unrelated (like recipes, weather, etc.), politely redirect them back to home remodeling services.
        
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
        
        Always be helpful and professional. For non-remodeling questions, say something like: "I specialize in home remodeling questions! Let me help you with your renovation needs instead. What home improvement project are you considering?"`;
        this.init();
    }

    generateSessionId() {
        return 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent);
        const isDesktop = !isMobile && !isTablet;
        
        // Detect specific devices and browsers
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isChrome = /Chrome/.test(userAgent);
        const isFirefox = /Firefox/.test(userAgent);
        
        return {
            userAgent: userAgent,
            deviceType: isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop'),
            isMobile: isMobile,
            isTablet: isTablet,
            isDesktop: isDesktop,
            isIOS: isIOS,
            isAndroid: isAndroid,
            browser: isChrome ? 'chrome' : (isSafari ? 'safari' : (isFirefox ? 'firefox' : 'other')),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                pixelRatio: window.devicePixelRatio || 1
            },
            touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0
        };
    }

    isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
    }

    isElementClickable(element) {
        if (!element || !this.isElementVisible(element)) return false;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Check if element at center point is the target element or a child
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        return element.contains(elementAtPoint) || elementAtPoint === element;
    }

    getElementPosition(element) {
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            visible: this.isElementVisible(element)
        };
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
        this.logEvent('chat_session_started', { sessionId: this.sessionId });
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

        console.log('Binding chat events...', { 
            chatButton: !!chatButton, 
            chatWidget: !!chatWidget, 
            closeButton: !!closeButton,
            messageInput: !!messageInput,
            sendButton: !!sendButton
        });

        // Debug missing elements
        if (!chatButton) console.error('❌ Missing: chat-widget-button element');
        if (!chatWidget) console.error('❌ Missing: chat-widget element');
        if (!closeButton) console.error('❌ Missing: close-chat-widget element');
        if (!messageInput) console.error('❌ Missing: chat input element');
        if (!sendButton) console.error('❌ Missing: chat send button element');

        if (chatButton && chatWidget) {
            console.log('✅ Adding click event listener to chat button');
            
            chatButton.addEventListener('click', (e) => {
                console.log('🖱️ Chat button clicked - basic handler');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const wasHidden = chatWidget.classList.contains('hidden');
                    console.log('Chat widget was hidden:', wasHidden);
                    
                    chatWidget.classList.toggle('hidden');
                    console.log('Chat widget toggled, now hidden:', chatWidget.classList.contains('hidden'));
                    
                    // Try to get device info safely
                    let deviceInfo = null;
                    try {
                        deviceInfo = this.getDeviceInfo();
                    } catch (error) {
                        console.warn('Could not get device info:', error);
                    }
                    
                    const clickInfo = {
                        trigger: 'button_click',
                        deviceInfo: deviceInfo,
                        clickCoordinates: {
                            x: e.clientX || 0,
                            y: e.clientY || 0
                        },
                        timestamp: new Date().toISOString()
                    };
                    
                    // Try to log event safely
                    try {
                        this.logEvent('chat_button_clicked', clickInfo);
                        console.log('✅ Button click logged successfully');
                    } catch (error) {
                        console.warn('Could not log button click:', error);
                    }
                    
                    if (wasHidden) {
                        try {
                            this.logEvent('chat_opened', { ...clickInfo, success: true });
                            messageInput?.focus();
                            console.log('✅ Chat opened and logged');
                        } catch (error) {
                            console.warn('Could not log chat opened:', error);
                        }
                    } else {
                        try {
                            this.logEvent('chat_closed', { ...clickInfo, success: true });
                            console.log('✅ Chat closed and logged');
                        } catch (error) {
                            console.warn('Could not log chat closed:', error);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error in chat button click handler:', error);
                    // Fallback - just toggle the widget
                    chatWidget.classList.toggle('hidden');
                }
            });
            
            console.log('✅ Chat button click handler added successfully');
        } else {
            console.error('❌ Cannot bind chat button - missing elements:', {
                chatButton: !!chatButton,
                chatWidget: !!chatWidget
            });
            
            // Try to log binding failure safely
            try {
                this.logEvent('chat_button_bind_failed', {
                    chatButton: !!chatButton,
                    chatWidget: !!chatWidget,
                    reason: !chatButton ? 'button_not_found' : 'widget_not_found',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.warn('Could not log binding failure:', error);
            }
        }

        if (closeButton && chatWidget) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                chatWidget.classList.add('hidden');
                this.logEvent('chat_closed', { trigger: 'close_button' });
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

        // Auto-open chat widget on page load with retry mechanism
        this.autoOpenChatWidget();
        
        // Track initial page state and responsiveness
        this.trackInitialPageState();

        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            this.logEvent('chat_session_ended', {
                duration: Date.now() - new Date(this.conversationLog.startTime).getTime(),
                messageCount: this.messages.length,
                bookingCompleted: !!this.conversationLog.completedBooking
            });
        });
    }

    autoOpenChatWidget(attempt = 1, maxAttempts = 5) {
        const delay = attempt === 1 ? 2000 : 1000; // Initial 2s delay, then 1s retries
        
        setTimeout(() => {
            console.log(`Auto-open attempt ${attempt}/${maxAttempts}...`);
            
            // Ensure DOM is ready and re-query elements
            if (document.readyState !== 'complete') {
                console.log('DOM not ready, waiting for document.readyState === complete');
                if (attempt < maxAttempts) {
                    this.autoOpenChatWidget(attempt + 1, maxAttempts);
                }
                return;
            }
            
            const autoOpenChatWidget = document.getElementById('chat-widget');
            const autoOpenMessageInput = document.querySelector('#chat-widget input');
            
            // Debug DOM state
            console.log('DOM Debug:', {
                readyState: document.readyState,
                chatWidget: !!autoOpenChatWidget,
                chatButton: !!document.getElementById('chat-widget-button'),
                closeButton: !!document.getElementById('close-chat-widget'),
                hasHiddenClass: autoOpenChatWidget?.classList.contains('hidden')
            });
            
            if (autoOpenChatWidget) {
                console.log('✅ Auto-opening chat widget successfully!');
                
                try {
                    autoOpenChatWidget.classList.remove('hidden');
                    autoOpenMessageInput?.focus();
                    
                    // Try to log the auto-open event safely
                    try {
                        const autoOpenInfo = {
                            trigger: 'auto_open',
                            attempt: attempt,
                            timestamp: new Date().toISOString()
                        };
                        this.logEvent('chat_opened', autoOpenInfo);
                        console.log('✅ Auto-open logged successfully');
                    } catch (error) {
                        console.warn('Could not log auto-open:', error);
                    }
                } catch (error) {
                    console.error('❌ Error during auto-open:', error);
                }
                
                return; // Success, stop retrying
            } else {
                console.warn(`❌ Auto-open attempt ${attempt} failed: chat-widget element not found`);
                
                // Retry if we haven't reached max attempts
                if (attempt < maxAttempts) {
                    console.log(`Retrying auto-open in ${1000}ms... (${attempt + 1}/${maxAttempts})`);
                    this.autoOpenChatWidget(attempt + 1, maxAttempts);
                } else {
                    const deviceInfo = this.getDeviceInfo();
                    const failureInfo = {
                        maxAttempts: maxAttempts,
                        deviceInfo: deviceInfo,
                        domState: {
                            readyState: document.readyState,
                            hasButton: !!document.getElementById('chat-widget-button'),
                            hasWidget: !!document.getElementById('chat-widget'),
                            hasCloseButton: !!document.getElementById('close-chat-widget')
                        }
                    };
                    
                    console.error('❌ Auto-open failed after all attempts. Chat widget may not be properly initialized.', failureInfo);
                    this.logEvent('chat_auto_open_failed', failureInfo);
                }
            }
        }, delay);
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
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            ...data
        };
        
        console.log('Chat Event:', eventData);
        
        // Enhanced event registration for chat opens
        if (eventType === 'chat_opened') {
            this.registerChatOpenEvent(eventData);
        }
        
        // Send to backend reporting endpoint
        this.sendToBackend('/api/chat-events', eventData);
        
        // Integrate with analytics tracker if available
        if (window.analyticsTracker) {
            window.analyticsTracker.trackChatEvent(eventData);
        }
    }

    registerChatOpenEvent(eventData) {
        console.log('🎯 CHAT OPENED EVENT REGISTERED:', eventData);
        
        // Add to localStorage for persistence
        const chatEvents = JSON.parse(localStorage.getItem('chat_events') || '[]');
        chatEvents.push(eventData);
        localStorage.setItem('chat_events', JSON.stringify(chatEvents));
        
        // Custom event dispatch for other parts of the application
        const customEvent = new CustomEvent('chatOpened', {
            detail: eventData
        });
        window.dispatchEvent(customEvent);
        
        // Additional tracking data for analytics
        const enhancedData = {
            ...eventData,
            deviceInfo: eventData.deviceInfo || this.getDeviceInfo(),
            timeOnPage: Date.now() - this.pageLoadTime,
            referrer: document.referrer,
            language: navigator.language,
            performance: {
                loadTime: this.pageLoadTime,
                eventTime: Date.now(),
                timeSinceLoad: Date.now() - this.pageLoadTime
            }
        };
        
        // Store enhanced event data
        localStorage.setItem('last_chat_open_event', JSON.stringify(enhancedData));
        
        console.log('📊 Enhanced chat open tracking:', enhancedData);
    }

    trackInitialPageState() {
        const deviceInfo = this.getDeviceInfo();
        const chatButton = document.getElementById('chat-widget-button');
        const chatWidget = document.getElementById('chat-widget');
        const closeButton = document.getElementById('close-chat-widget');
        
        const pageState = {
            deviceInfo: deviceInfo,
            elementsFound: {
                chatButton: !!chatButton,
                chatWidget: !!chatWidget,
                closeButton: !!closeButton
            },
            elementVisibility: {
                chatButtonVisible: this.isElementVisible(chatButton),
                chatButtonClickable: this.isElementClickable(chatButton),
                chatWidgetVisible: this.isElementVisible(chatWidget)
            },
            elementPositions: {
                chatButton: this.getElementPosition(chatButton),
                chatWidget: this.getElementPosition(chatWidget)
            },
            pageMetrics: {
                loadTime: this.pageLoadTime,
                documentReady: document.readyState,
                windowLoaded: document.readyState === 'complete'
            }
        };
        
        this.logEvent('chat_initial_page_state', pageState);
        console.log('📱 Initial page state tracked:', pageState);
        
        // Track viewport changes for responsiveness issues
        window.addEventListener('resize', () => {
            const newDeviceInfo = this.getDeviceInfo();
            this.logEvent('chat_viewport_changed', {
                oldViewport: deviceInfo.viewport,
                newViewport: newDeviceInfo.viewport,
                deviceInfo: newDeviceInfo
            });
        });
        
        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            this.logEvent('chat_page_visibility_changed', {
                hidden: document.hidden,
                visibilityState: document.visibilityState,
                deviceInfo: this.getDeviceInfo()
            });
        });
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
            
            bathroom: "Bathroom remodeling can really transform your daily routine! We specialize in both full renovations and smaller updates. Popular options include walk-in showers, new vanities, tile work, and accessibility modifications. Bathroom projects typically range from $8,000-$25,000. What specific changes are you considering?",
            
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
        const message = userMessage.toLowerCase();
        
        // Check for non-remodeling topics first
        if (message.includes('recipe') || message.includes('food') || message.includes('cook') || 
            message.includes('dinner') || message.includes('burger') || message.includes('meal') ||
            message.includes('weather') || message.includes('sports') || message.includes('movie') ||
            message.includes('music') || message.includes('forget') || message.includes('train')) {
            return demoResponses.unrelated;
        }
        
        // Build to suit and custom questions
        if (message.includes('build to suit') || message.includes('custom build') || message.includes('custom design')) {
            return "Absolutely! We specialize in build-to-suit and custom design projects. Whether you need a completely custom kitchen layout, unique built-in storage solutions, or a one-of-a-kind bathroom design, we work closely with you to create spaces that perfectly match your vision and lifestyle. Our design team will collaborate with you from concept to completion. What kind of custom project are you envisioning?";
        }
        
        if (message.includes('do you') || message.includes('can you')) {
            if (message.includes('kitchen') || message.includes('bathroom') || message.includes('remodel') || 
                message.includes('renovation') || message.includes('design') || message.includes('build')) {
                return "Yes! We handle all aspects of home remodeling including kitchen and bathroom renovations, whole home remodels, custom carpentry, flooring installation, plumbing, electrical work, and accessibility modifications. We're licensed, insured, and have 15+ years of experience. What specific project are you considering?";
            }
        }
        
        // Home remodeling topics
        if (message.includes('kitchen')) return demoResponses.kitchen;
        if (message.includes('bathroom')) return demoResponses.bathroom;
        if (message.includes('much') || message.includes('cost')) return demoResponses.cost;
        if (message.includes('price') || message.includes('pricing')) return demoResponses.price;
        if (message.includes('budget')) return demoResponses.budget;
        if (message.includes('time') || message.includes('long') || message.includes('when') || message.includes('timeline')) return demoResponses.timeline;
        if (message.includes('consultation') || message.includes('estimate') || message.includes('quote') || message.includes('appointment')) return demoResponses.consultation;
        if (message.includes('experience') || message.includes('licensed') || message.includes('insured')) return demoResponses.experience;
        if (message.includes('area') || message.includes('location') || message.includes('detroit')) return demoResponses.area;
        if (message.includes('floor') || message.includes('flooring')) return "We install all types of flooring including hardwood, tile, laminate, and luxury vinyl. Flooring projects typically range from $3,000-$15,000 depending on materials and square footage. What type of flooring are you considering?";
        if (message.includes('whole home') || message.includes('entire') || message.includes('complete')) return "Whole home remodeling is our specialty! These comprehensive projects typically range from $30,000-$150,000+ and take 8-12+ weeks. We handle everything from design to completion. What areas of your home are you looking to renovate?";


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