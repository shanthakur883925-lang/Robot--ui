#!/bin/bash

# Robot UI - GitHub Deployment Script
# This script helps you upload your project to GitHub

echo "🤖 Robot UI - GitHub Deployment Helper"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first:"
    echo "   sudo apt-get install git"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Check if already initialized
if [ -d ".git" ]; then
    echo "📁 Git repository already initialized"
else
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
fi

echo ""

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    echo "⚙️  Git user not configured. Let's set it up:"
    read -p "Enter your name: " git_name
    read -p "Enter your email: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
    echo "✅ Git user configured"
fi

echo ""
echo "📝 Current Git Status:"
git status --short
echo ""

# Ask if user wants to commit
read -p "Do you want to add and commit all files? (y/n): " commit_choice

if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
    git add .
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update Robot Control UI"
    fi
    git commit -m "$commit_msg"
    echo "✅ Files committed"
fi

echo ""
echo "🌐 GitHub Repository Setup"
echo "============================"
echo ""
echo "Please create a repository on GitHub first:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository (don't initialize with README)"
echo "3. Copy the repository URL"
echo ""

read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "📡 Remote 'origin' already exists. Updating..."
    git remote set-url origin "$repo_url"
else
    echo "📡 Adding remote 'origin'..."
    git remote add origin "$repo_url"
fi

echo "✅ Remote configured"
echo ""

# Ask if user wants to push
read -p "Do you want to push to GitHub now? (y/n): " push_choice

if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
    echo "🚀 Pushing to GitHub..."
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🎉 Your code is now on GitHub: $repo_url"
    else
        echo ""
        echo "❌ Push failed. You may need to:"
        echo "   1. Create a Personal Access Token on GitHub"
        echo "   2. Use the token as your password when prompted"
        echo "   3. Or set up SSH keys"
        echo ""
        echo "See: https://docs.github.com/en/authentication"
    fi
else
    echo "⏭️  Skipping push. You can push later with:"
    echo "   git push -u origin main"
fi

echo ""
echo "📚 Next Steps:"
echo "=============="
echo "1. ✅ Code is on GitHub"
echo "2. 📖 Read DEPLOYMENT_GUIDE.md for deployment options"
echo "3. 🚀 Deploy to a server to make it accessible"
echo "4. 🔗 Share the URL with users"
echo ""
echo "To run locally:"
echo "  npm install"
echo "  npm start"
echo "  Then open: http://localhost:8000"
echo ""
