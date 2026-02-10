#!/bin/bash

# Robot Control Web UI - Public Internet Access
# This script creates a shareable public link using ngrok

echo "🌍 Creating Public Link for Robot Control UI..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "📥 Installing ngrok..."
    
    # Download ngrok
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin/
    rm ngrok-v3-stable-linux-amd64.tgz
    
    echo "✅ ngrok installed successfully!"
    echo ""
fi

# Check if server is running
if ! lsof -i:8000 &> /dev/null; then
    echo "⚠️  Server is not running on port 8000"
    echo ""
    echo "Starting server in background..."
    npm start &
    SERVER_PID=$!
    sleep 3
    echo "✅ Server started (PID: $SERVER_PID)"
    echo ""
fi

echo "🚀 Creating public tunnel..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Your PUBLIC LINK will appear below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start ngrok
ngrok http 8000
