// Comprehensive Analytics Tracking System for Lazarus Home Remodeling
// Captures user sessions, form data, navigation, and interactions

class AnalyticsTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.ipAddress = null;
        this.location = null;
        this.startTime = Date.now();
        this.pageViews = [];
        this.currentPageStart = Date.now();
        this.interactions = [];
        this.formData = [];
        this.chatHistory = [];
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('lazarus_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('lazarus_user_id', userId);
        }
        return userId;
    }

    async init() {
        // Get IP address and location
        await this.getIPAndLocation();
        
        // Track page load
        this.trackPageView();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Track time on page
        this.setupTimeTracking();
        
        // Save session data
        this.saveSessionData();
        
        console.log('Analytics Tracker initialized:', {
            sessionId: this.sessionId,
            userId: this.userId,
            page: window.location.pathname
        });
    }

    async getIPAndLocation() {
        try {
            // Using free IP API services
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            this.ipAddress = ipData.ip;

            // Get location data (optional)
            const locationResponse = await fetch(`https://ipapi.co/${this.ipAddress}/json/`);
            const locationData = await locationResponse.json();
            this.location = {
                city: locationData.city,
                region: locationData.region,
                country: locationData.country_name,
                timezone: locationData.timezone
            };
        } catch (error) {
            console.log('Could not get IP/location:', error);
            this.ipAddress = 'unknown';
            this.location = { city: 'unknown', region: 'unknown', country: 'unknown' };
        }
    }

    trackPageView() {
        const pageView = {
            url: window.location.href,
            pathname: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            screenSize: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`
        };

        this.pageViews.push(pageView);
        this.currentPageStart = Date.now();
    }

    setupEventListeners() {
        // Track all form submissions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmission(e);
        });

        // Track all form inputs
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                this.trackFormInput(e);
            }
        });

        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Track scroll behavior
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 100);
        });

        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackVisibilityChange();
        });

        // Track before unload (when leaving page)
        window.addEventListener('beforeunload', () => {
            this.trackPageExit();
        });
    }

    setupTimeTracking() {
        // Update time spent every 10 seconds
        setInterval(() => {
            this.updateTimeSpent();
        }, 10000);
    }

    trackFormSubmission(event) {
        const form = event.target;
        const formData = new FormData(form);
        const formObject = {};
        
        for (let [key, value] of formData.entries()) {
            formObject[key] = value;
        }

        const submission = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userId: this.userId,
            formId: form.id || 'unknown',
            formAction: form.action || 'unknown',
            page: window.location.pathname,
            data: formObject,
            ipAddress: this.ipAddress,
            location: this.location
        };

        this.formData.push(submission);
        this.saveFormSubmissions();
        
        console.log('Form submission tracked:', submission);
    }

    trackFormInput(event) {
        const input = event.target;
        
        // Don't track password fields for security
        if (input.type === 'password') return;

        const interaction = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: 'form_input',
            elementId: input.id || 'unknown',
            elementName: input.name || 'unknown',
            elementType: input.type || input.tagName.toLowerCase(),
            value: input.value.length > 50 ? input.value.substring(0, 50) + '...' : input.value,
            page: window.location.pathname
        };

        this.interactions.push(interaction);
        
        // Save interactions periodically (not every keystroke)
        if (this.interactions.length % 10 === 0) {
            this.saveInteractions();
        }
    }

    trackClick(event) {
        const element = event.target;
        const interaction = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: 'click',
            elementTag: element.tagName,
            elementId: element.id || 'unknown',
            elementClass: element.className || 'unknown',
            elementText: element.textContent ? element.textContent.substring(0, 50) : '',
            href: element.href || null,
            page: window.location.pathname,
            coordinates: {
                x: event.clientX,
                y: event.clientY
            }
        };

        this.interactions.push(interaction);
        
        // Save immediately for important clicks
        if (element.tagName === 'A' || element.tagName === 'BUTTON') {
            this.saveInteractions();
        }
    }

    trackScroll() {
        const scrollData = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: 'scroll',
            scrollY: window.scrollY,
            scrollPercent: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100),
            page: window.location.pathname
        };

        this.interactions.push(scrollData);
    }

    trackVisibilityChange() {
        const visibility = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: 'visibility_change',
            hidden: document.hidden,
            page: window.location.pathname
        };

        this.interactions.push(visibility);
        this.saveInteractions();
    }

    trackPageExit() {
        // Update final time spent
        this.updateTimeSpent();
        
        const exit = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            type: 'page_exit',
            timeSpent: Date.now() - this.currentPageStart,
            page: window.location.pathname
        };

        this.interactions.push(exit);
        this.saveAllData();
    }

    updateTimeSpent() {
        if (this.pageViews.length > 0) {
            const currentPage = this.pageViews[this.pageViews.length - 1];
            currentPage.timeSpent = Date.now() - this.currentPageStart;
            this.savePageViews();
        }
    }

    // Chat integration
    trackChatMessage(userMessage, botResponse, step = null) {
        const chatEntry = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userId: this.userId,
            userMessage: userMessage,
            botResponse: botResponse,
            step: step,
            page: window.location.pathname,
            ipAddress: this.ipAddress,
            location: this.location
        };

        this.chatHistory.push(chatEntry);
        this.saveChatHistory();
    }

    // Data persistence methods
    saveSessionData() {
        const sessionData = {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: this.startTime,
            ipAddress: this.ipAddress,
            location: this.location,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            lastActive: new Date().toISOString()
        };

        localStorage.setItem('analytics_session', JSON.stringify(sessionData));
        
        // Also save to central sessions storage
        const allSessions = JSON.parse(localStorage.getItem('analytics_all_sessions') || '[]');
        const existingIndex = allSessions.findIndex(s => s.sessionId === this.sessionId);
        
        if (existingIndex >= 0) {
            allSessions[existingIndex] = sessionData;
        } else {
            allSessions.push(sessionData);
        }
        
        localStorage.setItem('analytics_all_sessions', JSON.stringify(allSessions));
    }

    savePageViews() {
        localStorage.setItem('analytics_page_views', JSON.stringify(this.pageViews));
        
        // Also save to central storage
        const allPageViews = JSON.parse(localStorage.getItem('analytics_all_page_views') || '[]');
        
        // Add current page views to global storage
        this.pageViews.forEach(pv => {
            const existingIndex = allPageViews.findIndex(apv => 
                apv.sessionId === this.sessionId && apv.pathname === pv.pathname && apv.startTime === pv.startTime
            );
            
            if (existingIndex >= 0) {
                allPageViews[existingIndex] = { ...pv, sessionId: this.sessionId };
            } else {
                allPageViews.push({ ...pv, sessionId: this.sessionId });
            }
        });
        
        localStorage.setItem('analytics_all_page_views', JSON.stringify(allPageViews));
    }

    saveInteractions() {
        localStorage.setItem('analytics_interactions', JSON.stringify(this.interactions));
        
        // Also save to central storage
        const allInteractions = JSON.parse(localStorage.getItem('analytics_all_interactions') || '[]');
        allInteractions.push(...this.interactions.map(i => ({ ...i, sessionId: this.sessionId })));
        localStorage.setItem('analytics_all_interactions', JSON.stringify(allInteractions));
        
        // Clear current interactions after saving to prevent duplicates
        this.interactions = [];
    }

    saveFormSubmissions() {
        localStorage.setItem('analytics_form_submissions', JSON.stringify(this.formData));
        
        // Also save to central storage
        const allForms = JSON.parse(localStorage.getItem('analytics_all_forms') || '[]');
        allForms.push(...this.formData);
        localStorage.setItem('analytics_all_forms', JSON.stringify(allForms));
    }

    saveChatHistory() {
        localStorage.setItem('analytics_chat_history', JSON.stringify(this.chatHistory));
        
        // Also save to central storage  
        const allChats = JSON.parse(localStorage.getItem('analytics_all_chats') || '[]');
        allChats.push(...this.chatHistory);
        localStorage.setItem('analytics_all_chats', JSON.stringify(allChats));
    }

    saveAllData() {
        this.saveSessionData();
        this.savePageViews();
        this.saveInteractions();
        this.saveFormSubmissions();
        this.saveChatHistory();
    }

    // Static method to get all analytics data (for admin dashboard)
    static getAllAnalytics() {
        return {
            sessions: JSON.parse(localStorage.getItem('analytics_all_sessions') || '[]'),
            pageViews: JSON.parse(localStorage.getItem('analytics_all_page_views') || '[]'),
            interactions: JSON.parse(localStorage.getItem('analytics_all_interactions') || '[]'),
            formSubmissions: JSON.parse(localStorage.getItem('analytics_all_forms') || '[]'),
            chatHistory: JSON.parse(localStorage.getItem('analytics_all_chats') || '[]')
        };
    }

    // Method to clear old data (admin function)
    static clearOldData(daysOld = 30) {
        const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        
        ['analytics_all_sessions', 'analytics_all_page_views', 'analytics_all_interactions', 
         'analytics_all_forms', 'analytics_all_chats'].forEach(key => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const filtered = data.filter(item => {
                const itemDate = new Date(item.timestamp || item.startTime).getTime();
                return itemDate > cutoffDate;
            });
            localStorage.setItem(key, JSON.stringify(filtered));
        });
    }
}

// Initialize analytics tracker when page loads
let analyticsTracker;
document.addEventListener('DOMContentLoaded', function() {
    analyticsTracker = new AnalyticsTracker();
    
    // Make it globally available for chat system integration
    window.analyticsTracker = analyticsTracker;
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}