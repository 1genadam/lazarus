// LAZARUS CHAT SYSTEM CONSOLE DIAGNOSTIC
// Copy and paste this entire script into your browser console on any page where chat is not working

console.log('%c🔍 LAZARUS CHAT DIAGNOSTIC STARTING...', 'color: #00ff00; font-size: 16px; font-weight: bold;');

const diagnostic = {
    results: [],
    
    log(category, test, status, message, details = '') {
        const result = { category, test, status, message, details, timestamp: new Date().toISOString() };
        this.results.push(result);
        
        const color = status === 'PASS' ? '#00ff00' : status === 'FAIL' ? '#ff0000' : '#ffaa00';
        const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
        
        console.log(`%c${symbol} [${category}] ${test}: ${message}`, `color: ${color}`);
        if (details) console.log(`   Details:`, details);
    },
    
    checkBasicInfo() {
        console.log('%c--- BASIC INFO ---', 'color: #ffff00; font-weight: bold;');
        this.log('BASIC', 'URL', 'PASS', window.location.href);
        this.log('BASIC', 'User Agent', 'PASS', navigator.userAgent);
        this.log('BASIC', 'Document State', document.readyState === 'complete' ? 'PASS' : 'WARN', document.readyState);
        this.log('BASIC', 'Viewport', 'PASS', `${window.innerWidth}x${window.innerHeight}`);
    },
    
    checkDOMElements() {
        console.log('%c--- DOM ELEMENTS CHECK ---', 'color: #ffff00; font-weight: bold;');
        
        const requiredElements = [
            'chat-widget-button',
            'chat-widget', 
            'close-chat-widget',
            'chat-messages',
            'chat-input',
            'send-chat-message'
        ];
        
        requiredElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const computed = window.getComputedStyle(el);
                const isVisible = computed.display !== 'none' && computed.visibility !== 'hidden';
                this.log('DOM', id, 'PASS', `Found (${isVisible ? 'visible' : 'hidden'})`, {
                    element: el,
                    classes: el.className,
                    display: computed.display,
                    visibility: computed.visibility
                });
            } else {
                this.log('DOM', id, 'FAIL', 'Element not found');
            }
        });
        
        // Check scripts
        const scripts = Array.from(document.scripts).map(s => s.src || s.innerHTML.substring(0, 100));
        const hasChatJs = scripts.some(src => src.includes('chat.js'));
        const hasAdminAuth = scripts.some(src => src.includes('admin-auth.js'));
        
        this.log('DOM', 'chat.js script', hasChatJs ? 'PASS' : 'FAIL', hasChatJs ? 'Found' : 'Missing');
        this.log('DOM', 'admin-auth.js script', hasAdminAuth ? 'PASS' : 'WARN', hasAdminAuth ? 'Found' : 'Missing');
    },
    
    checkJavaScript() {
        console.log('%c--- JAVASCRIPT ENVIRONMENT ---', 'color: #ffff00; font-weight: bold;');
        
        // Check chat system
        if (typeof window.lazarusChat !== 'undefined') {
            this.log('JS', 'Chat Instance', 'PASS', 'window.lazarusChat exists', window.lazarusChat);
        } else {
            this.log('JS', 'Chat Instance', 'FAIL', 'window.lazarusChat not found');
        }
        
        if (typeof LazarusChatWidget !== 'undefined') {
            this.log('JS', 'Chat Class', 'PASS', 'LazarusChatWidget available');
        } else {
            this.log('JS', 'Chat Class', 'FAIL', 'LazarusChatWidget not found');
        }
        
        if (typeof window.adminAuth !== 'undefined') {
            this.log('JS', 'Admin Auth', 'PASS', 'Available');
        } else {
            this.log('JS', 'Admin Auth', 'WARN', 'Not loaded');
        }
    },
    
    testChatFunctionality() {
        console.log('%c--- CHAT FUNCTIONALITY TEST ---', 'color: #ffff00; font-weight: bold;');
        
        const chatButton = document.getElementById('chat-widget-button');
        const chatWidget = document.getElementById('chat-widget');
        
        if (chatButton && chatWidget) {
            const wasHidden = chatWidget.classList.contains('hidden');
            
            try {
                // Simulate click
                chatButton.click();
                
                setTimeout(() => {
                    const nowHidden = chatWidget.classList.contains('hidden');
                    if (wasHidden !== nowHidden) {
                        this.log('TEST', 'Button Click', 'PASS', 'Chat toggles on click');
                    } else {
                        this.log('TEST', 'Button Click', 'FAIL', 'Chat does not toggle');
                    }
                    
                    // Reset state
                    if (wasHidden) chatWidget.classList.add('hidden');
                    else chatWidget.classList.remove('hidden');
                }, 100);
                
            } catch (error) {
                this.log('TEST', 'Button Click', 'FAIL', 'Click test error', error);
            }
        } else {
            this.log('TEST', 'Button Click', 'FAIL', 'Missing button or widget elements');
        }
        
        // Test input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            try {
                chatInput.value = 'test';
                const works = chatInput.value === 'test';
                chatInput.value = '';
                this.log('TEST', 'Input Field', works ? 'PASS' : 'FAIL', works ? 'Input accepts text' : 'Input not working');
            } catch (error) {
                this.log('TEST', 'Input Field', 'FAIL', 'Input test error', error);
            }
        }
    },
    
    checkNetwork() {
        console.log('%c--- NETWORK CHECKS ---', 'color: #ffff00; font-weight: bold;');
        
        // Health check
        fetch('/health')
            .then(response => response.json())
            .then(data => {
                this.log('NETWORK', 'Health Check', 'PASS', 'Backend responding', data);
            })
            .catch(error => {
                this.log('NETWORK', 'Health Check', 'FAIL', 'Backend not responding', error.message);
            });
            
        // API config
        fetch('/api/config')
            .then(response => response.json())
            .then(data => {
                this.log('NETWORK', 'API Config', 'PASS', 'API config available', data);
            })
            .catch(error => {
                this.log('NETWORK', 'API Config', 'WARN', 'API config not available', error.message);
            });
    },
    
    generateReport() {
        setTimeout(() => {
            console.log('%c--- DIAGNOSTIC COMPLETE ---', 'color: #00ffff; font-size: 16px; font-weight: bold;');
            
            const summary = {
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                results: this.results
            };
            
            const passed = this.results.filter(r => r.status === 'PASS').length;
            const failed = this.results.filter(r => r.status === 'FAIL').length;
            const warnings = this.results.filter(r => r.status === 'WARN').length;
            
            console.log(`%c📊 SUMMARY: ${passed} passed, ${failed} failed, ${warnings} warnings`, 'color: #ffffff; font-size: 14px;');
            
            console.log('%c📋 FULL REPORT (copy this):', 'color: #ffff00; font-weight: bold;');
            console.log(JSON.stringify(summary, null, 2));
            
            // Also log as a single string for easy copying
            let reportText = `LAZARUS CHAT DIAGNOSTIC REPORT\\n`;
            reportText += `Generated: ${summary.timestamp}\\n`;
            reportText += `URL: ${summary.url}\\n`;
            reportText += `User Agent: ${summary.userAgent}\\n`;
            reportText += `${'='.repeat(50)}\\n\\n`;
            
            this.results.forEach(result => {
                reportText += `[${result.status}] ${result.category} - ${result.test}: ${result.message}\\n`;
                if (result.details && typeof result.details === 'string') {
                    reportText += `Details: ${result.details}\\n`;
                }
                reportText += '\\n';
            });
            
            console.log('%c📄 TEXT REPORT:', 'color: #00ffff; font-weight: bold;');
            console.log(reportText);
            
            return summary;
        }, 3000);
    },
    
    run() {
        this.checkBasicInfo();
        this.checkDOMElements();
        this.checkJavaScript();
        this.testChatFunctionality();
        this.checkNetwork();
        this.generateReport();
    }
};

// Run diagnostic
diagnostic.run();

console.log('%c💡 TIP: Look for the "FULL REPORT" and "TEXT REPORT" sections above to copy and share with the developer.', 'color: #ffaa00; font-style: italic;');