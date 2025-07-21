#!/bin/bash

# Lazarus Home Remodeling Website - Complete Deployment Script
# Handles git push, Fly.io deployment, and cache clearing

echo "🏠 Lazarus Home Remodeling - Complete Deployment Pipeline"
echo "=================================================="

# Set GitHub repository URL
GITHUB_REPO="https://github.com/1genadam/lazarus"
DOMAIN="lazarushomeremodeling.com"
FLY_APP="lazarus-home-remodeling"

# Function to handle errors
handle_error() {
    echo "❌ Error: $1"
    exit 1
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to clear system cache
clear_system_cache() {
    echo "🧹 STEP 0: Clearing System Cache"
    echo "--------------------------------"
    
    # Detect operating system and clear DNS cache
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "🍎 Clearing macOS DNS cache..."
        sudo dscacheutil -flushcache
        sudo killall -HUP mDNSResponder
        echo "✅ macOS DNS cache cleared"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "🐧 Clearing Linux DNS cache..."
        if command_exists systemctl; then
            sudo systemctl restart systemd-resolved 2>/dev/null || echo "⚠️  systemd-resolved not available"
        fi
        # Clear nscd cache if available
        if command_exists nscd; then
            sudo nscd -i hosts 2>/dev/null || echo "⚠️  nscd not available"
        fi
        echo "✅ Linux DNS cache cleared"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        echo "🪟 Clearing Windows DNS cache..."
        ipconfig //flushdns
        echo "✅ Windows DNS cache cleared"
    else
        echo "⚠️  Unknown OS, skipping DNS cache clear"
    fi
    
    # Clear local browser cache instructions
    echo "📱 Browser cache clearing:"
    echo "   - Chrome/Safari: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)"
    echo "   - Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
    echo ""
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
command_exists git || handle_error "Git is not installed"
command_exists flyctl || handle_error "Fly CLI is not installed. Install with: brew install flyctl"
echo "✅ Prerequisites checked"

# Clear system cache first
clear_system_cache

# Git Operations
echo ""
echo "📁 STEP 1: Git Repository Operations"
echo "------------------------------------"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git remote add origin $GITHUB_REPO
fi

# Update remote origin
echo "🔗 Setting remote origin: $GITHUB_REPO"
git remote set-url origin $GITHUB_REPO 2>/dev/null || git remote add origin $GITHUB_REPO

# Check git status
echo "📋 Checking git status..."
git status --short

# Add all files
echo "📁 Staging all changes..."
git add -A

# Create commit if there are changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "📝 Creating commit..."
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Get a brief summary of changes
    CHANGED_FILES=$(git diff --name-only --cached | head -5 | tr '\n' ', ' | sed 's/,$//')
    
    git commit -m "Deploy Lazarus Home Remodeling - $TIMESTAMP

Modified files: $CHANGED_FILES

Features:
- Chat functionality with OpenAI integration
- Multi-step consultation form with auto-save
- About page team section with company photo
- Responsive design across all pages
- Kitchen and Bathroom design showcases

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    echo "✅ Commit created successfully"
else
    echo "ℹ️  No changes to commit"
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "📤 Creating main branch and pushing..."
    git checkout -b main 2>/dev/null || git checkout main
    git push -u origin main || handle_error "Failed to push to GitHub"
fi

# Fly.io Deployment
echo ""
echo "🚁 STEP 2: Fly.io Deployment"
echo "-----------------------------"

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    handle_error "fly.toml not found. Run 'flyctl launch' first."
fi

# Check Fly.io authentication
echo "🔐 Checking Fly.io authentication..."
if ! flyctl auth whoami >/dev/null 2>&1; then
    echo "⚠️  Not logged into Fly.io. Please run: flyctl auth login"
    read -p "Do you want to login now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        flyctl auth login || handle_error "Failed to login to Fly.io"
    else
        handle_error "Fly.io authentication required"
    fi
fi

# Get app name from fly.toml
APP_NAME=$(grep "app.*=" fly.toml | cut -d'"' -f2)
echo "🎯 Deploying to Fly.io app: $APP_NAME"

# Deploy to Fly.io
echo "🚀 Starting Fly.io deployment..."
if flyctl deploy; then
    echo "✅ Successfully deployed to Fly.io!"
else
    handle_error "Fly.io deployment failed"
fi

# Final status and cache clearing
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "✅ Git: Pushed to $GITHUB_REPO"
echo "✅ Fly.io: Deployed to https://$APP_NAME.fly.dev"
echo "✅ Cache: System DNS cache cleared"
echo ""
echo "🌐 Primary URL (Custom Domain):"
echo "   🎯 https://$DOMAIN"
echo ""
echo "🔄 Backup URL (Fly.io):"
echo "   🚁 https://$APP_NAME.fly.dev"
echo ""
echo "⏱️  DNS Propagation:"
echo "   - Local cache cleared, changes should be immediate"
echo "   - Global DNS propagation: 5-60 minutes"
echo "   - If you still see old content, try incognito/private browsing"
echo ""
echo "📊 Next Steps:"
echo "   1. Test primary domain: https://$DOMAIN"
echo "   2. Verify chat functionality with OpenAI integration"
echo "   3. Check multi-step form submissions"
echo "   4. Test on mobile devices"
echo "   5. Monitor logs: flyctl logs"
echo ""
echo "🔧 Troubleshooting:"
echo "   - If domain shows old content: Clear browser cache (Cmd+Shift+R)"
echo "   - If domain not working: Check DNS at dnschecker.org"
echo "   - If chat not working: Check browser console for API errors"
echo ""
echo "🎯 Deployment completed successfully to $DOMAIN!"