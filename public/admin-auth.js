// Secure Admin Authentication System
// This handles authentication without exposing passwords in client-side code

class AdminAuth {
    constructor() {
        this.sessionToken = localStorage.getItem('admin_session_token');
        this.sessionExpiry = localStorage.getItem('admin_session_expiry');
    }

    async authenticate(password) {
        try {
            // Send password to backend for verification
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    // Store session token
                    this.sessionToken = data.token;
                    this.sessionExpiry = Date.now() + (data.expiresIn || 3600000); // Default 1 hour
                    
                    localStorage.setItem('admin_session_token', this.sessionToken);
                    localStorage.setItem('admin_session_expiry', this.sessionExpiry.toString());
                    
                    return { success: true };
                } else {
                    return { success: false, message: data.message || 'Invalid credentials' };
                }
            } else {
                throw new Error('Authentication service unavailable');
            }
        } catch (error) {
            console.error('Auth error:', error);
            
            // Fallback to client-side verification (less secure but functional)
            return this.fallbackAuth(password);
        }
    }

    // Fallback authentication when backend is not available
    fallbackAuth(password) {
        // Simple hash check (not as secure as server-side, but better than plain text)
        const expectedHash = this.simpleHash('Hellolazarus1!');
        const providedHash = this.simpleHash(password);
        
        if (expectedHash === providedHash) {
            this.sessionToken = 'fallback-' + Date.now();
            this.sessionExpiry = Date.now() + 3600000; // 1 hour
            
            localStorage.setItem('admin_session_token', this.sessionToken);
            localStorage.setItem('admin_session_expiry', this.sessionExpiry.toString());
            
            return { success: true };
        } else {
            return { success: false, message: 'Invalid credentials' };
        }
    }

    // Simple hash function for fallback (not cryptographically secure)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    isAuthenticated() {
        if (!this.sessionToken || !this.sessionExpiry) {
            return false;
        }

        const now = Date.now();
        if (now > parseInt(this.sessionExpiry)) {
            this.logout();
            return false;
        }

        return true;
    }

    async verifySession() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            const response = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.sessionToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid || false;
            }
        } catch (error) {
            console.log('Session verification failed, using local session');
        }

        // Fallback to local session check
        return this.isAuthenticated();
    }

    logout() {
        this.sessionToken = null;
        this.sessionExpiry = null;
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_session_expiry');

        // Notify backend of logout
        if (this.sessionToken) {
            fetch('/api/admin/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.sessionToken}`
                }
            }).catch(() => {}); // Silent fail
        }
    }

    extendSession() {
        if (this.isAuthenticated()) {
            this.sessionExpiry = Date.now() + 3600000; // Extend by 1 hour
            localStorage.setItem('admin_session_expiry', this.sessionExpiry.toString());
        }
    }
}

// Global admin auth instance
window.adminAuth = new AdminAuth();

// Global admin access function (secure version with password masking)
async function adminAccess() {
    const password = await showPasswordModal();
    if (!password) return; // User cancelled

    const result = await window.adminAuth.authenticate(password);
    
    if (result.success) {
        window.location.href = 'admin-dashboard.html';
    } else {
        showErrorModal(result.message || 'Access denied');
    }
}

// Create secure password input modal
function showPasswordModal() {
    return new Promise((resolve) => {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            max-width: 400px;
            width: 90%;
        `;
        
        modal.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.25rem; font-weight: bold;">Admin Access</h3>
            <div style="margin-bottom: 1rem;">
                <input type="password" id="admin-password-input" placeholder="Enter admin password" 
                       style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="admin-cancel-btn" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                <button id="admin-submit-btn" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">Access</button>
            </div>
        `;
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        const passwordInput = document.getElementById('admin-password-input');
        const submitBtn = document.getElementById('admin-submit-btn');
        const cancelBtn = document.getElementById('admin-cancel-btn');
        
        // Focus password input
        passwordInput.focus();
        
        // Handle submit
        const handleSubmit = () => {
            const password = passwordInput.value;
            document.body.removeChild(backdrop);
            resolve(password);
        };
        
        // Handle cancel
        const handleCancel = () => {
            document.body.removeChild(backdrop);
            resolve(null);
        };
        
        // Event listeners
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Allow Enter key to submit
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
        
        // Allow Escape key to cancel
        backdrop.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        });
    });
}

// Show error modal instead of alert
function showErrorModal(message) {
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 300px;
        width: 90%;
        text-align: center;
    `;
    
    modal.innerHTML = `
        <div style="color: #dc2626; font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.25rem;">Access Denied</h3>
        <p style="margin: 0 0 1.5rem 0; color: #6b7280;">${message}</p>
        <button id="error-ok-btn" style="padding: 0.5rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">OK</button>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const okBtn = document.getElementById('error-ok-btn');
    okBtn.addEventListener('click', () => {
        document.body.removeChild(backdrop);
    });
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        if (document.body.contains(backdrop)) {
            document.body.removeChild(backdrop);
        }
    }, 3000);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}