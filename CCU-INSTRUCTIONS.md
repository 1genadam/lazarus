# CCU Instructions: Chat System Diagnostic

## 🎯 Mission: Diagnose Chat System Issues

The chat system on the Lazarus Home Remodeling website is not working. We need to run diagnostics to identify the problem.

## 📋 Step-by-Step Instructions

### Step 1: Navigate to the Diagnostic Tool
1. Go to the project folder: `/Users/robertsher/Projects/lazarus/`
2. Open the file `chat-diagnostic.html` in a web browser
3. This will load the diagnostic tool

### Step 2: Test Each Problem Page
**Run the diagnostic on each of these pages where chat is NOT working:**
- https://lazarushomeremodeling.com/ (main page)
- https://lazarushomeremodeling.com/about.html
- https://lazarushomeremodeling.com/services.html  
- https://lazarushomeremodeling.com/contact.html
- https://lazarushomeremodeling.com/gallery.html
- https://lazarushomeremodeling.com/blog.html

### Step 3: Run Diagnostic Process
For EACH page:
1. Navigate to the page in browser
2. Open the diagnostic tool (`chat-diagnostic.html`) in a new tab
3. Click "🚀 Run Full Diagnostic" 
4. Wait for results to complete (about 5-10 seconds)
5. Click "💾 Download Report File"
6. Save file as: `chat-diagnostic-[PAGE-NAME]-[DATE].txt`
   - Example: `chat-diagnostic-about-2025-07-23.txt`

### Step 4: Save Reports
Save all diagnostic files to:
- **Primary location**: Desktop folder named `lazarus-chat-reports`
- **Backup location**: `/Users/robertsher/Desktop/lazarus-chat-reports/`

### Step 5: Generate Summary
Create a summary file called `SUMMARY.txt` with:
```
CHAT SYSTEM DIAGNOSTIC SUMMARY
Date: [Current Date]
Total Pages Tested: [Number]

Pages where chat is NOT working:
- [Page 1]: [Main issues found]
- [Page 2]: [Main issues found]
- etc.

Common Issues Found:
- [List recurring problems across pages]

Files Generated:
- chat-diagnostic-index-[date].txt
- chat-diagnostic-about-[date].txt
- etc.
```

## 🚨 What to Look For

### Chat Button Issues:
- Button not visible
- Button not clickable
- No response when clicked

### JavaScript Errors:
- Missing chat.js script
- Console errors
- Missing DOM elements

### Network Issues:
- Backend connection problems
- API configuration issues
- Resource loading failures

## 📤 Expected Output

You should generate these files:
1. Individual diagnostic reports for each page (6 files)
2. One summary file explaining the problems
3. All files saved to Desktop in `lazarus-chat-reports` folder

## 🎯 Success Criteria

✅ Diagnostic run on all 6 pages
✅ Individual reports downloaded and saved
✅ Summary file created with main issues identified
✅ All files organized in proper folder
✅ Reports ready for developer analysis

## ⚠️ Troubleshooting

If diagnostic tool doesn't work:
1. Try opening `chat-diagnostic.html` directly from file system
2. Or use the console diagnostic method (see `console-diagnostic.js`)
3. Copy and paste that script into browser console (F12)

The goal is to get comprehensive data about what's preventing the chat system from working so the developer can fix it quickly.