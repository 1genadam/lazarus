# CCU Collaboration Prompt: Lazarus Chat System Diagnostic

## 🎯 **MISSION BRIEFING**

You are tasked with diagnosing and troubleshooting the chat system on the Lazarus Home Remodeling website. The chat widget is not loading properly and buttons are not clickable across multiple pages. You will use comprehensive diagnostic tools and collaborate with the developer via FTP file sharing.

**Project**: Lazarus Home Remodeling Website  
**Issue**: Chat system loading and clickability problems  
**Collaboration Method**: FTP file sharing (localhost:21)  
**Expected Duration**: 30-60 minutes  

---

## 🖥️ **YOUR ENVIRONMENT**

You are operating in a Claude Computer Use container with the following capabilities:
- **Web Browser**: For navigating and testing websites
- **File System Access**: Create, edit, and organize diagnostic reports
- **FTP Server**: Upload reports to developer via localhost:21
- **Desktop Environment**: Full GUI access for comprehensive testing

**Container Details:**
- Web Interface: You're already in the CCU environment
- FTP Credentials: ftpuser / ftppass
- Upload Directory: /home/ftpuser/ftp/

---

## 📋 **STEP-BY-STEP DIAGNOSTIC PROCESS**

### **Phase 1: Setup and Preparation (5 minutes)**

1. **Create Working Directory**
   ```bash
   mkdir -p /home/computeruse/Desktop/lazarus-diagnostics
   cd /home/computeruse/Desktop/lazarus-diagnostics
   ```

2. **Access Diagnostic Tools**
   - Navigate to: `/Users/robertsher/Projects/lazarus/diagnostic-tools/`
   - Copy `chat-diagnostic.html` to your desktop working directory
   - You'll use this tool to analyze each problematic page

3. **Open Browser and Prepare**
   - Open Firefox or Chrome
   - Have multiple tabs ready for testing
   - Prepare to take notes on findings

### **Phase 2: Comprehensive Page Testing (20-30 minutes)**

**Test each of these pages systematically:**

1. **Homepage**: https://lazarushomeremodeling.com/
2. **About Page**: https://lazarushomeremodeling.com/about.html
3. **Services Page**: https://lazarushomeremodeling.com/services.html
4. **Contact Page**: https://lazarushomeremodeling.com/contact.html
5. **Gallery Page**: https://lazarushomeremodeling.com/gallery.html
6. **Blog Page**: https://lazarushomeremodeling.com/blog.html

**For Each Page:**

A. **Navigate to the page**
B. **Open diagnostic tool** (`chat-diagnostic.html`) in new tab
C. **Run full diagnostic** and wait for completion
D. **Download the report** and save as `chat-diagnostic-[PAGE-NAME]-[DATE].txt`
E. **Manual testing**:
   - Try clicking the chat button (yellow circular button, bottom-right)
   - Check if chat widget opens/closes
   - Test input field functionality
   - Note any console errors (F12 → Console)
   - Take screenshot if issues are visual

### **Phase 3: Pattern Analysis and Summary (10 minutes)**

1. **Review all diagnostic reports**
2. **Identify common issues** across pages
3. **Create comprehensive summary**
4. **Document visual observations**

### **Phase 4: FTP Upload and Collaboration (5 minutes)**

Upload all findings to the FTP server for developer analysis.

---

## 📊 **DIAGNOSTIC EXPECTATIONS**

### **What You're Looking For:**

**🔴 Critical Issues:**
- Chat button not visible or not clickable
- JavaScript errors preventing chat system initialization
- Missing DOM elements (chat-widget-button, chat-messages, etc.)
- Network failures connecting to backend APIs

**🟡 Warning Signs:**
- Chat widget loads but doesn't function properly
- Slow loading of chat-related resources
- Browser console warnings
- Inconsistent behavior across pages

**🟢 Working Elements:**
- Proper HTML structure and element IDs
- Successful script loading
- Backend connectivity
- Functional button interactions

### **Expected Diagnostic Results:**

Each diagnostic report should show results like:
```
[PASS] DOM - chat-widget-button: Found (visible)
[FAIL] DOM - chat-messages: Element not found
[WARN] JS - Chat Instance: window.lazarusChat not found
[PASS] NETWORK - Health Check: Backend responding
[FAIL] TEST - Button Click: Chat widget does not toggle
```

---

## 📁 **FILE ORGANIZATION AND NAMING**

### **Create These Files:**

```
/home/computeruse/Desktop/lazarus-diagnostics/
├── chat-diagnostic-homepage-2025-07-23.txt
├── chat-diagnostic-about-2025-07-23.txt
├── chat-diagnostic-services-2025-07-23.txt
├── chat-diagnostic-contact-2025-07-23.txt
├── chat-diagnostic-gallery-2025-07-23.txt
├── chat-diagnostic-blog-2025-07-23.txt
├── DIAGNOSTIC-SUMMARY.txt
├── VISUAL-OBSERVATIONS.txt
└── screenshots/
    ├── homepage-chat-issue.png
    ├── about-chat-button.png
    └── console-errors.png
```

### **Summary File Template:**

Create `DIAGNOSTIC-SUMMARY.txt` with this structure:
```
LAZARUS CHAT SYSTEM - DIAGNOSTIC SUMMARY
========================================
Date: [Current Date and Time]
CCU Operator: Claude Computer Use
Total Pages Tested: 6

CRITICAL ISSUES FOUND:
- [List major problems affecting all/most pages]

COMMON PATTERNS:
- [Issues that appear across multiple pages]

PAGE-SPECIFIC ISSUES:
- Homepage: [Specific issues]
- About: [Specific issues]
- Services: [Specific issues]
- Contact: [Specific issues]
- Gallery: [Specific issues]
- Blog: [Specific issues]

WORKING COMPONENTS:
- [List what IS working correctly]

RECOMMENDED ACTIONS:
1. [Priority 1 fix]
2. [Priority 2 fix]
3. [Priority 3 fix]

TECHNICAL DETAILS:
- Browser Used: [Chrome/Firefox version]
- Operating System: [Container OS]
- Network Connectivity: [Status]
- Backend API Status: [Status]

NEXT STEPS FOR DEVELOPER:
- [Specific recommendations for fixes]
```

---

## 📤 **FTP UPLOAD PROCESS**

### **Upload All Files to Developer:**

1. **Connect to FTP Server**
   ```bash
   ftp localhost 21
   # Login: ftpuser
   # Password: ftppass
   ```

2. **Create Project Directory**
   ```bash
   mkdir lazarus-chat-diagnostics-[DATE]
   cd lazarus-chat-diagnostics-[DATE]
   ```

3. **Upload All Files**
   ```bash
   lcd /home/computeruse/Desktop/lazarus-diagnostics
   prompt off
   mput *.txt
   mkdir screenshots
   cd screenshots
   lcd screenshots
   mput *.png
   ```

4. **Verify Upload**
   ```bash
   ls -la
   cd screenshots
   ls -la
   ```

5. **Create Status File**
   Create a file called `UPLOAD-COMPLETE.txt`:
   ```
   LAZARUS DIAGNOSTICS - UPLOAD COMPLETE
   ====================================
   Date: [Current Date/Time]
   Files Uploaded: [Number] diagnostic reports + summary
   Screenshots: [Number] images
   Status: Ready for developer review
   
   Issues Found: [Brief summary]
   Urgency Level: [High/Medium/Low]
   
   Next Step: Developer analysis and fix implementation
   ```

---

## 🎯 **SUCCESS CRITERIA**

### **You Have Successfully Completed This Task When:**

✅ **All 6 pages tested** with diagnostic reports generated  
✅ **Common issues identified** across multiple pages  
✅ **Comprehensive summary created** with actionable recommendations  
✅ **Visual evidence captured** via screenshots  
✅ **All files uploaded** to FTP server in organized structure  
✅ **Developer notified** via UPLOAD-COMPLETE.txt status file  

### **Quality Checklist:**

- [ ] Each diagnostic report is complete and readable
- [ ] Summary clearly identifies root causes and patterns  
- [ ] Screenshots show visual evidence of issues
- [ ] File naming is consistent and descriptive
- [ ] FTP upload completed successfully with verification
- [ ] Recommendations are specific and actionable

---

## 🚨 **TROUBLESHOOTING YOUR DIAGNOSTIC PROCESS**

### **If Diagnostic Tool Doesn't Work:**
- Try opening `chat-diagnostic.html` directly from file system
- Use browser console method: F12 → Console → paste diagnostic JavaScript
- Take manual notes of observations

### **If Website Doesn't Load:**
- Check internet connectivity
- Try different browser
- Note any network errors in console

### **If FTP Upload Fails:**
- Verify you're in CCU container environment
- Check FTP credentials: ftpuser / ftppass
- Try uploading files one at a time

### **If You Get Stuck:**
- Document what you've completed so far
- Upload partial results with notes about where you encountered issues
- Create an ISSUES-ENCOUNTERED.txt file explaining problems

---

## 💡 **TIPS FOR EFFECTIVE COLLABORATION**

### **Communication Best Practices:**
- **Be Specific**: Include exact error messages and steps to reproduce
- **Include Context**: Note browser version, page URL, time of testing
- **Provide Evidence**: Screenshots are worth a thousand words
- **Suggest Solutions**: If you see obvious fixes, mention them
- **Stay Organized**: Clear file naming and directory structure

### **Technical Insights to Look For:**
- **Missing JavaScript files**: Look for 404 errors in Network tab
- **DOM structure issues**: Check if required elements exist with correct IDs
- **Event listener problems**: See if click events are properly attached
- **CSS conflicts**: Look for styling issues hiding elements
- **Network timeouts**: API calls that fail or take too long

---

## 🎯 **EXPECTED OUTCOME**

After completing this diagnostic process, the developer will have:

1. **Complete Issue Map**: Exact problems on each page
2. **Root Cause Analysis**: Understanding of why chat system isn't working  
3. **Priority Action List**: Clear steps to fix the problems
4. **Validation Method**: Way to confirm fixes are working
5. **Visual Evidence**: Screenshots showing current state vs expected behavior

**Your thorough diagnostic work will enable rapid problem resolution and get the chat system working properly across all pages.**

---

**🚀 BEGIN DIAGNOSTIC PROCESS NOW**

*Remember: You are the eyes and hands of the developer in this debugging process. Your detailed analysis will directly lead to fixing the chat system and improving the customer experience on the Lazarus Home Remodeling website.*