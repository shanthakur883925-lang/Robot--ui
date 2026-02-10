#!/bin/bash

echo "🤖 Robot UI - Quick GitHub Upload"
echo "=================================="
echo ""
echo "This script will help you upload your code to GitHub in 3 easy steps!"
echo ""

# Check if git is configured
git_user=$(git config user.name)
git_email=$(git config user.email)

if [ "$git_user" = "Your Name" ] || [ -z "$git_user" ]; then
    echo "⚙️  Let's configure Git first:"
    read -p "Enter your name: " name
    read -p "Enter your email: " email
    git config user.name "$name"
    git config user.email "$email"
    echo "✅ Git configured!"
    echo ""
fi

echo "📋 STEP 1: Create GitHub Repository"
echo "------------------------------------"
echo ""
echo "Please do the following:"
echo "1. Open your browser and go to: https://github.com/new"
echo "2. Login to your GitHub account"
echo "3. Repository name: robot-control-ui (or any name you like)"
echo "4. Choose Public or Private"
echo "5. ❌ DO NOT check 'Initialize with README'"
echo "6. Click 'Create repository'"
echo ""
read -p "Press ENTER when you've created the repository..."
echo ""

echo "📋 STEP 2: Enter Repository Details"
echo "------------------------------------"
echo ""
read -p "Enter your GitHub username: " username
read -p "Enter your repository name (e.g., robot-control-ui): " reponame

repo_url="https://github.com/$username/$reponame.git"

echo ""
echo "Repository URL: $repo_url"
echo ""
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Cancelled. Please run the script again."
    exit 1
fi

echo ""
echo "📋 STEP 3: Upload to GitHub"
echo "----------------------------"
echo ""

# Add remote
if git remote | grep -q "origin"; then
    echo "Updating existing remote..."
    git remote set-url origin "$repo_url"
else
    echo "Adding remote repository..."
    git remote add origin "$repo_url"
fi

# Ensure we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "Renaming branch to 'main'..."
    git branch -M main
fi

echo ""
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  You will be asked for your GitHub credentials:"
echo "   Username: $username"
echo "   Password: Use a Personal Access Token (NOT your GitHub password)"
echo ""
echo "📖 How to create a Personal Access Token:"
echo "   1. Go to: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "   3. Give it a name (e.g., 'Robot UI Upload')"
echo "   4. Check the 'repo' checkbox"
echo "   5. Click 'Generate token'"
echo "   6. Copy the token and use it as your password below"
echo ""
read -p "Press ENTER to continue with push..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your code is now on GitHub!"
    echo "🎉 View it at: https://github.com/$username/$reponame"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Share your repository with others"
    echo "2. Read DEPLOYMENT_GUIDE.md to deploy it online"
    echo "3. Users can access it at http://YOUR_SERVER_IP:8000"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo ""
    echo "1. Authentication failed:"
    echo "   → Make sure you used a Personal Access Token, not your password"
    echo "   → Create one at: https://github.com/settings/tokens"
    echo ""
    echo "2. Repository doesn't exist:"
    echo "   → Make sure you created the repository on GitHub first"
    echo "   → Check the repository name is correct"
    echo ""
    echo "3. Permission denied:"
    echo "   → Make sure the repository belongs to your account"
    echo ""
    echo "You can try again by running: ./quick-upload.sh"
    echo ""
fi
