# Git Workflow for Lazarus Home Remodeling Project

## 📤 Repository Information
- **GitHub**: https://github.com/1genadam/lazarus
- **Main Branch**: `main` 
- **License**: Private repository
- **Current Authentication**: Personal Access Token (requires setup)

## 🔄 Automated Publishing

### Primary Method: Automated Script (Recommended)
> **✅ This project includes automated publishing via `publish_to_git.sh`**
> 
> **Why This Method is Recommended:**
> - ✅ **One-command deployment** - Single script handles everything
> - ✅ **Error handling** - Built-in validation and troubleshooting
> - ✅ **Consistent commits** - Standardized commit messages
> - ✅ **Repository management** - Automatic remote setup and branch handling

```bash
# Use the automated publishing script
chmod +x publish_to_git.sh
./publish_to_git.sh
```

### Manual Git Workflow
```bash
# Check status and add files
git status
git add .

# Create descriptive commit
git commit -m "Update website features

- Enhanced chat system with OpenAI integration
- Improved admin dashboard analytics  
- Fixed security authentication modal
- Updated responsive design elements

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

## 🔐 Authentication Setup

### ✅ CURRENT METHOD: Personal Access Token (Configured)
```bash
# Configure your Personal Access Token in the remote URL:
# 1. Create token at GitHub → Settings → Developer settings → Personal access tokens
# 2. Select 'repo' permissions
# 3. Update remote URL with your token:
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/1genadam/lazarus.git

# 4. Then push normally:
git push origin main
```

**Example Token Configuration:**
```bash
# Replace YOUR_GITHUB_TOKEN with your actual token
git remote set-url origin https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/1genadam/lazarus.git
```

### Alternative: SSH Key Setup
```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# 2. Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# 3. Copy public key and add to GitHub
cat ~/.ssh/id_ed25519.pub

# 4. Update remote URL
git remote set-url origin git@github.com:1genadam/lazarus.git
```

## 📋 Commit Message Standards

### Format Template
```bash
git commit -m "Brief description (50 chars or less)

Detailed explanation of changes:
- Bullet point 1 with specific change
- Bullet point 2 with feature addition
- Bullet point 3 with bug fix or improvement

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Example Commit Messages
```bash
# Feature Addition
git commit -m "Add AI-powered chat system

- Integrated OpenAI GPT-3.5-turbo for customer assistance
- Implemented 5-step booking flow for lead capture
- Added auto-open chat widget with yellow styling
- Created comprehensive conversation logging system

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Security Enhancement
git commit -m "Implement secure admin authentication

- Replace hardcoded passwords with environment variables
- Add password masking modal for admin access
- Create session-based authentication system
- Update all pages to use secure authentication flow

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com)"

# Bug Fix
git commit -m "Fix mobile navigation and form validation

- Resolved hamburger menu toggle on mobile devices
- Fixed form validation for contact form fields
- Improved responsive design for tablet breakpoints
- Updated JavaScript event handling for better UX

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🚀 Deployment Workflow

### Complete Deployment Process
```bash
# 1. Development and Testing
# Make changes to website files
# Test locally by opening public/index.html

# 2. Git Workflow
git status                    # Check changes
git add .                     # Stage all changes
git commit -m "Description"   # Create commit
git push origin main          # Push to GitHub

# 3. Automated Publishing (Alternative)
./publish_to_git.sh          # One-command deployment
```

### Publishing Script Features
The `publish_to_git.sh` script handles:
- ✅ **Git repository initialization** (if needed)
- ✅ **Remote origin configuration** 
- ✅ **Automatic file staging**
- ✅ **Timestamped commit creation**
- ✅ **Branch management** (main/master)
- ✅ **Error handling and troubleshooting**
- ✅ **Success confirmation and next steps**

## 🔧 Repository Configuration

### Remote Configuration
```bash
# Check current remotes
git remote -v

# Should show:
# origin    https://ghp_token@github.com/1genadam/lazarus.git (fetch)
# origin    https://ghp_token@github.com/1genadam/lazarus.git (push)
```

### Branch Management
```bash
# Check current branch
git branch

# Switch to main (if needed)
git checkout main

# Create and switch to feature branch
git checkout -b feature/new-feature

# Merge feature to main
git checkout main
git merge feature/new-feature
git push origin main
```

## 🔒 Security Best Practices

### Code Security
```bash
# ✅ Always use environment variables for sensitive data
# ❌ Never commit API keys or passwords to version control
# ✅ Keep .env files local and use .env.example for templates
# ✅ Use .gitignore to prevent accidental secret commits

# Check for secrets before committing
git diff --cached | grep -i "api_key\|password\|secret\|token"
```

### File Security
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.log" >> .gitignore

# Check .gitignore is working
git status  # Should not show .env files
```

## 🚨 Troubleshooting

### Common Issues and Solutions
```bash
# Authentication Error
# Error: could not read Username for 'https://github.com'
# Solution: Configure Personal Access Token in remote URL:
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/1genadam/lazarus.git
git push origin main

# Permission Denied
# Error: Permission denied (publickey)
# Solution: Either use token method or setup SSH key

# Repository Not Found
# Error: remote: Repository not found
# Solution: Check repository URL and authentication
git remote -v
```

### Emergency Recovery
```bash
# Reset to last working commit
git reset --hard HEAD~1

# Force push (use carefully)
git push --force origin main

# Restore deleted files
git checkout HEAD -- filename.html
```

## 📊 Workflow Status

| Component | Status | Method |
|-----------|--------|---------|
| **Repository Setup** | ✅ Active | GitHub with token auth |
| **Publishing Script** | ✅ Active | `publish_to_git.sh` automation |
| **Branch Management** | ✅ Active | Main branch deployment |
| **Security** | ✅ Active | Environment variables, no hardcoded secrets |
| **Documentation** | ✅ Active | Comprehensive readme structure |

**Current Production URL**: Ready for GitHub Pages or static hosting  
**Repository URL**: https://github.com/1genadam/lazarus

---

## ✅ Quick Commands Reference

```bash
# Daily workflow
git status && git add . && git commit -m "Update: description" && git push origin main

# Automated publishing
./publish_to_git.sh

# Check repository status
git log --oneline -5 && git remote -v

# Emergency reset
git reset --hard HEAD~1 && git push --force origin main
```

*Last Updated: July 21, 2025*