# Troubleshooting Guide - Lazarus Home Remodeling

## 🚨 Common Issues & Solutions

This comprehensive troubleshooting guide covers all common issues you might encounter with the Lazarus Home Remodeling website and provides step-by-step solutions.

---

## 🔐 Authentication & Admin Issues

### **❌ Admin Login Not Working**

**Symptoms:**
- Password modal appears but login fails
- "Access denied" error message
- Modal doesn't appear when clicking "System"

**Solutions:**
```bash
# 1. Verify correct password
Password: Hellolazarus1!

# 2. Clear browser cache and cookies
# Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
# Safari: Develop menu → Empty Caches

# 3. Test in incognito/private window
# Right-click browser → "New Incognito Window"

# 4. Check browser console for errors
# F12 → Console tab → Look for red errors
```

**Advanced Debugging:**
```javascript
// Test authentication system in browser console
window.adminAuth.authenticate('Hellolazarus1!').then(result => {
    console.log('Auth result:', result);
});
```

### **❌ Password Modal Not Masking Input**

**Symptoms:**
- Password shows as plain text instead of asterisks
- Old browser prompt appears instead of custom modal

**Solutions:**
```bash
# 1. Verify admin-auth.js is loaded
# Check browser Network tab for 404 errors

# 2. Clear browser cache completely
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 3. Check file path in HTML
grep -n "admin-auth.js" public/*.html
```

### **❌ Session Timeout Issues**

**Symptoms:**
- Logged out immediately after login
- Session expires too quickly

**Solutions:**
```javascript
// Check session status in browser console
console.log('Session token:', localStorage.getItem('admin_session_token'));
console.log('Session expiry:', localStorage.getItem('admin_session_expiry'));

// Manually extend session
window.adminAuth.extendSession();
```

---

## 💬 Chat System Issues

### **❌ Chat Widget Not Appearing**

**Symptoms:**
- No chat button visible on page
- Chat widget doesn't auto-open

**Solutions:**
```bash
# 1. Check if chat.js is loaded
# Open browser Network tab, refresh page
# Look for chat.js in loaded files

# 2. Verify script tag in HTML
grep -n "chat.js" public/*.html

# 3. Check browser console for errors
# F12 → Console → Look for JavaScript errors
```

**Manual Fix:**
```html
<!-- Add this before closing </body> tag if missing -->
<script src="chat.js"></script>
```

### **❌ AI Responses Not Working**

**Symptoms:**
- Chat shows "I'd be happy to help..." generic responses
- No intelligent AI responses
- API errors in console

**Solutions:**
```bash
# 1. Check OpenAI API key in .env
cat .env | grep OPENAI_API_KEY

# 2. Test API key validity
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}],"max_tokens":10}' \
     https://api.openai.com/v1/chat/completions

# 3. Check network connectivity
# Open browser Network tab → Try chat → Look for failed API calls
```

**Fallback Testing:**
```javascript
// Test fallback system in browser console
const chat = new ChatSystem();
console.log(chat.getFallbackResponse('kitchen remodeling costs'));
```

### **❌ Booking Flow Stuck**

**Symptoms:**
- Booking process doesn't advance to next step
- Validation errors not clearing
- Form data not saving

**Solutions:**
```javascript
// Check booking flow state in browser console
console.log('Current step:', window.chatSystem?.currentBookingStep);
console.log('Booking data:', window.chatSystem?.bookingData);

// Reset booking flow
localStorage.removeItem('chatBookingData');
location.reload();
```

**Manual Reset:**
```bash
# Clear all chat data
localStorage.clear();
# Refresh page to restart
```

---

## 🌐 Website Display Issues

### **❌ Page Not Loading Properly**

**Symptoms:**
- Blank page or partial content
- Styling not applied
- Images not displaying

**Solutions:**
```bash
# 1. Hard refresh to clear cache
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 2. Check file permissions
ls -la public/

# 3. Verify all files present
ls public/
# Should show: index.html, services.html, contact.html, etc.

# 4. Test in different browser
# Try Chrome, Firefox, Safari
```

### **❌ Mobile Layout Broken**

**Symptoms:**
- Desktop layout on mobile
- Text too small
- Navigation not working on mobile

**Solutions:**
```html
<!-- Verify viewport meta tag in HTML head -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

```bash
# Test mobile layout
# Chrome: F12 → Device toolbar (phone icon)
# Safari: Develop → Enter Responsive Design Mode
```

### **❌ Contact Form Not Working**

**Symptoms:**
- Form submission does nothing
- Validation not working
- Success message not showing

**Solutions:**
```javascript
// Check form event listeners in browser console
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    console.log('Form submitted:', e);
});
```

**Debug Form Data:**
```javascript
// Test form data collection
const formData = new FormData(document.getElementById('contact-form'));
for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
}
```

---

## 🚀 Deployment Issues

### **❌ Git Push Failures**

**Symptoms:**
- "Permission denied" errors
- "Repository not found" 
- Authentication failures

**Solutions:**
```bash
# 1. Check git remote configuration
git remote -v
# Should show token in URL

# 2. Reconfigure remote if needed
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/1genadam/lazarus.git

# 3. Test authentication
git ls-remote origin

# 4. Check git status
git status
# Look for untracked files or conflicts
```

### **❌ Publishing Script Fails**

**Symptoms:**
- `./publish_to_git.sh` command not found
- Script runs but fails to push
- Permission denied on script

**Solutions:**
```bash
# 1. Make script executable
chmod +x publish_to_git.sh

# 2. Run script with bash if needed
bash publish_to_git.sh

# 3. Check script contents
cat publish_to_git.sh
# Verify GitHub URL is correct

# 4. Debug step by step
git add .
git commit -m "Test commit"
git push origin main
```

### **❌ GitHub Pages Not Updating**

**Symptoms:**
- Changes pushed but website not updating
- Old version still showing
- 404 errors on GitHub Pages

**Solutions:**
```bash
# 1. Check GitHub Pages settings
# Visit: https://github.com/1genadam/lazarus/settings/pages

# 2. Verify branch selection
# Should be set to 'main' branch

# 3. Force cache refresh
# Add ?v=timestamp to URL
# Example: https://1genadam.github.io/lazarus?v=20250721
```

---

## 🔧 Environment & Configuration

### **❌ Environment Variables Not Loading**

**Symptoms:**
- API keys not working
- Chat system using fallback responses only
- Configuration errors

**Solutions:**
```bash
# 1. Check .env file exists and has content
cat .env

# 2. Verify .env format (no spaces around =)
OPENAI_API_KEY=sk-proj-your-key-here
ADMIN_PASSWORD=Hellolazarus1!

# 3. Check .gitignore includes .env
grep ".env" .gitignore

# 4. Restart any running servers after .env changes
```

### **❌ File Not Found Errors**

**Symptoms:**
- 404 errors for CSS/JS files
- Admin dashboard shows as blank page
- Images not loading

**Solutions:**
```bash
# 1. Check file paths in HTML
grep -n "src=" public/*.html
grep -n "href=" public/*.html

# 2. Verify files exist
ls -la public/
# Look for: admin-auth.js, chat.js, etc.

# 3. Check case sensitivity
# MacOS is case-insensitive, servers often case-sensitive
```

---

## 📊 Performance Issues

### **❌ Slow Loading Times**

**Symptoms:**
- Pages take long time to load
- Chat responses are slow
- Images loading slowly

**Solutions:**
```bash
# 1. Check browser Network tab
# F12 → Network → Refresh page
# Look for slow or failed requests

# 2. Optimize images if large
# Compress images or convert to WebP

# 3. Check CDN resources
# Verify Tailwind CSS and FontAwesome CDNs are accessible
```

### **❌ High API Costs**

**Symptoms:**
- Unexpected OpenAI charges
- Too many API calls
- Rate limit errors

**Solutions:**
```javascript
// Check API call frequency in chat.js
// Look for rate limiting code:
if (!this.rateLimiter.canMakeRequest()) {
    return this.getFallbackResponse(message);
}
```

```bash
# Monitor API usage
# Check OpenAI dashboard: https://platform.openai.com/usage
```

---

## 📧 Email System Issues

### **❌ Form Emails Not Being Received**

**Symptoms:**
- Form submissions show success message
- Health check shows `"email": "configured"`
- No emails arriving in Spacemail inbox

**Diagnostic Steps:**
```bash
# 1. Check health endpoint
curl https://lazarushomeremodeling.com/health
# Should show: "email": "configured"

# 2. Test form submission and check logs
flyctl logs -a lazarus-home-remodeling | grep -E "(email|Email|form|Form)"

# 3. Verify SMTP credentials
flyctl secrets list | grep EMAIL_PASSWORD
```

**Solutions:**
```bash
# 1. Check/Update email password in Fly.io
flyctl secrets set EMAIL_PASSWORD="your_correct_spaceship_password"
flyctl deploy

# 2. Verify Spacemail account access
# Login to: https://www.spacemail.com/mail/
# Check if emails are in spam folder

# 3. Test email sending capability
# Submit test form and check server logs for:
# ✅ "Email sent successfully" or ❌ "Email sending failed"
```

### **❌ SMTP Authentication Failed**

**Symptoms:**
- Server logs show "Email sending failed"
- Authentication errors in server console
- Health check may show `"email": "disabled"`

**Solutions:**
```bash
# 1. Verify correct Spaceship email password
# Login to Spaceship control panel to confirm password

# 2. Update Fly.io secret with correct password
flyctl secrets set EMAIL_PASSWORD="correct_password"

# 3. Verify SMTP settings match Spaceship requirements
# Host: mail.spacemail.com
# Port: 587
# Security: STARTTLS
# Username: robert@lazarushomeremodeling.com
```

### **✅ Email System Working (Verified July 21, 2025)**

**Successful Test Results:**
- **Contact Form Test**: Email delivered 6:06 PM ET
- **Direct SMTP Test**: Email delivered 9:24 PM ET  
- **Status**: Fully operational with professional templates

**Current Configuration:**
```javascript
// Verified working SMTP settings
{
    host: 'mail.spacemail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
        user: 'robert@lazarushomeremodeling.com',
        pass: process.env.EMAIL_PASSWORD // Correctly configured
    }
}
```

**Monitoring:**
- Health endpoint: `https://lazarushomeremodeling.com/health`
- Spacemail inbox: `https://www.spacemail.com/mail/`
- Server logs: `flyctl logs -a lazarus-home-remodeling`

---

## 📅 Appointment Date Issues

### **❌ Users Can Select Past Dates**

**Symptoms:**
- Date picker allows selection of today or earlier dates
- Appointments scheduled for same day cause scheduling conflicts
- No validation preventing invalid date selection

**Solutions:**
```javascript
// Date validation is automatically applied
// Minimum date is set to tomorrow dynamically
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
```

### **❌ Form Submission with Invalid Date**

**Symptoms:**
- Form allows submission with past dates
- Error message: "Please select a date starting tomorrow or later"

**Solutions:**
```javascript
// Client-side validation in validateStep(3)
const selectedDate = new Date(dateInput.value);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate <= today) {
    alert('Please select a date starting tomorrow or later for your appointment.');
    return false;
}
```

### **✅ Date Validation Working (Implemented July 21, 2025)**

**Current Implementation:**
- **Browser Level**: Date picker minimum set to tomorrow
- **JavaScript Validation**: Form submission validates date selection
- **User Feedback**: Clear error messages guide proper date selection
- **Dynamic Updates**: Minimum date automatically updates each day

**Validation Rules:**
- No same-day appointments (prevents scheduling conflicts)
- Minimum 1-day advance booking (allows proper preparation)
- Dynamic date calculation (works across month/year boundaries)

---

## 🛠️ Emergency Recovery

### **❌ Complete System Failure**

**Nuclear Option - Start Fresh:**
```bash
# 1. Backup current state
cp -r public/ backup-$(date +%Y%m%d)/

# 2. Reset to last known good commit
git log --oneline -10
git reset --hard COMMIT_HASH

# 3. Force push to GitHub
git push --force origin main

# 4. Clear all browser data
# Chrome: Settings → Privacy → Clear browsing data → All time
```

### **❌ Admin Locked Out**

**Recovery Steps:**
```bash
# 1. Update password in .env file
echo "ADMIN_PASSWORD=NewPassword123" >> .env

# 2. Update fallback authentication in admin-auth.js
# Find line: this.simpleHash('Hellolazarus1!')
# Replace with: this.simpleHash('NewPassword123')

# 3. Clear browser storage
localStorage.clear();
sessionStorage.clear();

# 4. Test new password
```

### **❌ Repository Corrupted**

**Recovery Steps:**
```bash
# 1. Clone fresh copy
git clone https://github.com/1genadam/lazarus.git lazarus-recovery

# 2. Copy your changes
cp -r public/ lazarus-recovery/
cp .env lazarus-recovery/

# 3. Push from fresh repository
cd lazarus-recovery
git add .
git commit -m "Recovery commit"
git push origin main
```

---

## 📞 Support Escalation

### **When to Get Help**
- Multiple troubleshooting attempts failed
- Security-related issues
- Data loss concerns
- Business-critical functionality down

### **Information to Collect Before Getting Help**
```bash
# System information
uname -a                    # Operating system
git --version              # Git version
node --version 2>/dev/null  # Node.js version (if applicable)

# Error details
# Browser console errors (F12 → Console)
# Network tab failures (F12 → Network)
# Git error messages
# File permissions: ls -la

# Recent changes
git log --oneline -5       # Recent commits
git status                 # Current changes
```

### **Contact Information**
- **Business Phone**: (586) 248-8888
- **GitHub Issues**: https://github.com/1genadam/lazarus/issues
- **Documentation**: `/readme` directory in project

---

## ✅ Prevention Checklist

### **Regular Maintenance**
- [ ] Test admin login monthly
- [ ] Verify chat system responses
- [ ] Check GitHub Pages deployment
- [ ] Backup .env file securely
- [ ] Monitor OpenAI API usage
- [ ] Update dependencies if any

### **Before Making Changes**
- [ ] Test in local environment first
- [ ] Backup current working state
- [ ] Use git branches for major changes
- [ ] Test all functionality after changes
- [ ] Clear browser cache when testing

### **Security Monitoring**
- [ ] Check for hardcoded secrets
- [ ] Verify .env is in .gitignore
- [ ] Monitor admin access logs
- [ ] Regular password updates
- [ ] Review GitHub repository access

---

**🔧 Remember: Most issues are resolved with cache clearing and hard refresh!**

*Last Updated: July 21, 2025*  
*Support Level: **Comprehensive***