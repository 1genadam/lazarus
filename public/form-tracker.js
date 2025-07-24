// Form Tracking Integration for Lazarus Home Remodeling
// Captures all form submissions and integrates with analytics system

class FormTracker {
    constructor() {
        this.init();
    }

    init() {
        // Track all form submissions on the page
        document.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Track form interactions (when user starts filling)
        document.addEventListener('input', (e) => this.handleFormInput(e));
        
        console.log('Form Tracker initialized');
    }

    handleFormSubmit(event) {
        const form = event.target;
        
        // Prevent multiple submissions
        if (form.dataset.submitted === 'true') {
            event.preventDefault();
            return;
        }
        
        const formData = this.extractFormData(form);
        const submissionData = {
            timestamp: new Date().toISOString(),
            formId: form.id || this.guessFormType(form),
            formAction: form.action || window.location.href,
            formMethod: form.method || 'GET',
            page: window.location.pathname,
            data: formData,
            userAgent: navigator.userAgent
        };

        // Log to analytics if available
        if (window.analyticsTracker) {
            // Analytics tracker will handle IP and location
            console.log('Form submitted - tracking with analytics:', submissionData);
        } else {
            // Fallback - save to local storage
            this.saveToLocalStorage(submissionData);
        }

        // Mark form as submitted
        form.dataset.submitted = 'true';
        
        // Show success feedback
        this.showSuccessFeedback(form);
    }

    handleFormInput(event) {
        const input = event.target;
        
        // Only track form inputs, not other inputs
        if (!this.isFormInput(input)) return;
        
        // Don't track passwords
        if (input.type === 'password') return;
        
        // Track form interaction start (first input in form)
        const form = input.closest('form');
        if (form && !form.dataset.interactionLogged) {
            form.dataset.interactionLogged = 'true';
            
            const interactionData = {
                timestamp: new Date().toISOString(),
                formId: form.id || this.guessFormType(form),
                page: window.location.pathname,
                firstField: input.name || input.id || input.type,
                userAgent: navigator.userAgent
            };
            
            console.log('Form interaction started:', interactionData);
            
            // Log to analytics
            if (window.analyticsTracker) {
                // This will be captured by the analytics tracker's input handler
            }
        }
    }

    extractFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Don't capture password fields for security
            if (key.toLowerCase().includes('password')) {
                data[key] = '[HIDDEN]';
            } else {
                data[key] = value;
            }
        }
        
        // Also capture any non-form-data fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name && !data[input.name]) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    data[input.name] = input.checked;
                } else if (input.type !== 'password') {
                    data[input.name] = input.value;
                }
            }
        });
        
        return data;
    }

    guessFormType(form) {
        // Try to determine form type from various clues
        const formHtml = form.outerHTML.toLowerCase();
        
        if (formHtml.includes('contact') || formHtml.includes('message')) {
            return 'contact-form';
        } else if (formHtml.includes('quote') || formHtml.includes('estimate')) {
            return 'quote-form';
        } else if (formHtml.includes('consultation') || formHtml.includes('appointment')) {
            return 'consultation-form';
        } else if (formHtml.includes('newsletter') || formHtml.includes('subscribe')) {
            return 'newsletter-form';
        } else {
            return 'unknown-form';
        }
    }

    isFormInput(element) {
        return element && 
               element.closest('form') && 
               (element.tagName === 'INPUT' || 
                element.tagName === 'SELECT' || 
                element.tagName === 'TEXTAREA');
    }

    saveToLocalStorage(submissionData) {
        try {
            const existingData = JSON.parse(localStorage.getItem('form_submissions') || '[]');
            existingData.push(submissionData);
            localStorage.setItem('form_submissions', JSON.stringify(existingData));
            console.log('Form submission saved to localStorage:', submissionData);
        } catch (error) {
            console.error('Failed to save form submission:', error);
        }
    }

    showSuccessFeedback(form) {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
        successMessage.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
            </div>
        `;
        
        // Insert before form
        form.parentNode.insertBefore(successMessage, form);
        
        // Hide form submit button and show success state
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Sent Successfully';
            submitButton.className = submitButton.className.replace(/bg-\w+-\d+/, 'bg-green-500');
        }
        
        // Auto-remove success message after 10 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 10000);
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Static method to get all form submissions (for admin dashboard)
    static getAllFormSubmissions() {
        try {
            return JSON.parse(localStorage.getItem('form_submissions') || '[]');
        } catch (error) {
            console.error('Failed to load form submissions:', error);
            return [];
        }
    }

    // Static method to clear form submissions
    static clearFormSubmissions() {
        localStorage.removeItem('form_submissions');
    }
}

// Initialize form tracker when page loads
document.addEventListener('DOMContentLoaded', function() {
    new FormTracker();
});

// Make it globally available
window.FormTracker = FormTracker;