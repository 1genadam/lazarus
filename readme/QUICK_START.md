# Quick Start Guide - Lazarus Home Remodeling Website

## 🚀 Getting Started in 5 Minutes

This guide will get you up and running with the Lazarus Home Remodeling website project quickly.

---

## ⚡ One-Minute Setup

### **For Immediate Use (Static Website)**
```bash
# 1. Open the website locally
open public/index.html

# That's it! The website is fully functional as static files.
```

### **For Development Work**
```bash
# 1. Navigate to project
cd /Users/robertsher/Projects/lazarus

# 2. Make changes to files in public/
# 3. Test by opening public/index.html in browser

# 4. Deploy changes
./publish_to_git.sh
```

---

## 📁 Project Structure Overview

```
lazarus/
├── public/                    # Website files (ready to deploy)
│   ├── index.html            # Main homepage
│   ├── services.html         # Services showcase
│   ├── contact.html          # Contact form
│   ├── admin-dashboard.html  # Admin interface
│   ├── admin-auth.js         # Security system
│   └── chat.js              # AI chat system
├── .env                      # Environment variables (secure)
├── .gitignore               # Git ignore file
├── publish_to_git.sh        # Deployment script
├── README.md                # Project overview
└── readme/                  # Documentation
    ├── index.md             # This documentation index
    └── ...                  # Additional guides
```

---

## 🎯 Key Features & How to Use

### **1. Website Navigation**
- **Homepage**: Complete home remodeling showcase
- **Services**: Detailed service offerings with pricing
- **Contact**: Professional contact form with validation
- **Admin**: Secure dashboard for chat analytics

### **2. AI-Powered Chat System**
- **Auto-opens** on page load for immediate customer engagement
- **5-step booking flow**: Name → Phone → Email → Project → Confirmation
- **OpenAI integration**: GPT-3.5-turbo for intelligent responses
- **Fallback system**: Keyword responses when API unavailable

### **3. Secure Admin System**
- **Access**: Click "System" link in footer
- **Password**: `Hellolazarus1!` (masked input)
- **Features**: Chat analytics, lead management, data export
- **Security**: Session-based authentication, no hardcoded secrets

---

## 🔧 Common Tasks

### **Making Content Changes**
```bash
# Edit any file in public/ directory
nano public/index.html

# Test changes
open public/index.html

# Deploy to GitHub
./publish_to_git.sh
```

### **Updating Chat Responses**
```bash
# Edit chat.js for AI responses
nano public/chat.js

# Update system prompt or fallback responses
# Test by interacting with chat widget
# Deploy changes with publish script
```

### **Accessing Admin Dashboard**
1. Visit any page on the website
2. Scroll to footer and click "System"
3. Enter password: `Hellolazarus1!`
4. View chat analytics and manage leads

### **Managing Environment Variables**
```bash
# Edit .env file (never commit this)
nano .env

# Update API keys or configuration
OPENAI_API_KEY=your-new-key
ADMIN_PASSWORD=new-secure-password
```

---

## 🚀 Deployment Options

### **Option 1: GitHub Pages (Recommended)**
```bash
# Already configured! Just push changes:
./publish_to_git.sh

# Then enable GitHub Pages in repository settings
# Website will be available at: https://1genadam.github.io/lazarus
```

### **Option 2: Static Hosting (Netlify, Vercel)**
```bash
# Upload public/ directory contents
# Set environment variables in hosting dashboard
# Point domain to hosting service
```

### **Option 3: Custom Server**
```bash
# Copy public/ directory to web server
# Configure HTTPS and environment variables
# Set up proper MIME types for assets
```

---

## 🔍 Testing Checklist

### **Basic Functionality Test**
- [ ] Homepage loads with all sections
- [ ] Navigation menu works on all pages
- [ ] Contact forms validate properly
- [ ] Chat widget auto-opens and responds
- [ ] Mobile design looks professional

### **Chat System Test**
- [ ] Chat widget opens automatically
- [ ] AI responses are relevant and helpful
- [ ] Booking flow captures all information
- [ ] Fallback responses work without API
- [ ] Conversation logging functions

### **Admin System Test**
- [ ] Footer "System" link works
- [ ] Password modal masks input properly
- [ ] Admin dashboard shows analytics
- [ ] Lead data exports correctly
- [ ] Session timeout works as expected

---

## 🚨 Troubleshooting

### **Chat Not Working**
```bash
# Check browser console for errors
# Verify .env file has OPENAI_API_KEY
# Test fallback responses (should work without API)
```

### **Admin Login Issues**
```bash
# Verify password: Hellolazarus1!
# Clear browser cache
# Check browser console for JavaScript errors
```

### **Deployment Problems**
```bash
# Check git authentication
git remote -v

# Should show token in URL
# If not, reconfigure:
git remote set-url origin https://TOKEN@github.com/1genadam/lazarus.git
```

### **Mobile Display Issues**
```bash
# Clear browser cache
# Test in private/incognito mode
# Verify viewport meta tag in HTML
```

---

## 📞 Support & Contact

### **Business Information**
- **Phone**: (586) 248-8888
- **Hours**: Mon-Fri 8AM-6PM, Sat 9AM-4PM
- **Services**: Kitchen, Bathroom, Accessibility, Full Home Remodeling

### **Technical Support**
- **Repository**: https://github.com/1genadam/lazarus
- **Documentation**: `/readme` directory
- **Issues**: Check troubleshooting guide or create GitHub issue

---

## 🎯 Next Steps

### **For Website Managers**
1. **Review Admin Dashboard** - Check chat analytics weekly
2. **Update Content** - Refresh service pricing as needed
3. **Monitor Performance** - Track conversion rates and engagement
4. **Export Leads** - Download customer data for CRM integration

### **For Developers**
1. **Review Documentation** - Read full docs in `/readme` directory
2. **Set Up Environment** - Configure .env with your API keys
3. **Customize Features** - Modify chat responses or styling
4. **Test Thoroughly** - Use testing checklist before deployment

### **For Business Users**
1. **Learn Admin Interface** - Familiarize yourself with dashboard
2. **Understand Chat Flow** - Know how customers interact with AI
3. **Export Customer Data** - Regular lead management routine
4. **Monitor Conversions** - Track booking completion rates

---

## ✅ Quick Reference

### **Essential Commands**
```bash
# Deploy changes
./publish_to_git.sh

# View recent logs
git log --oneline -5

# Check file status
git status

# Test locally
open public/index.html
```

### **Important Files**
- `public/index.html` - Main website
- `public/chat.js` - Chat system
- `public/admin-auth.js` - Security
- `.env` - Configuration (secure)
- `publish_to_git.sh` - Deployment

### **Key URLs**
- **Repository**: https://github.com/1genadam/lazarus
- **Admin Password**: `Hellolazarus1!`
- **Business Phone**: (586) 248-8888

---

**🎉 You're Ready to Go!**

The Lazarus Home Remodeling website is production-ready with AI chat, secure admin access, and professional design. Start by testing the features locally, then deploy your changes with the automated publishing script.

*Last Updated: July 21, 2025*  
*Project Status: **✅ Production Ready***