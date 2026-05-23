#!/bin/bash
# Production Deployment Script untuk TitipMart
# Usage: bash deploy-production.sh

set -e

echo "=========================================="
echo "TitipMart Production Deployment Script"
echo "=========================================="
echo ""

# Variables
DEPLOY_DIR="/app/titipmart"
APP_NAME="titipmart"
NODE_ENV="production"
PORT="${PORT:-3000}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Create deploy directory if not exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Creating deployment directory: $DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR"
fi

echo "📂 Navigating to: $DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Copy/Pull files
echo "📥 Pulling latest code..."
git pull origin main || echo "ℹ️ Git pull skipped (not a git repo)"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Build application
echo "🔨 Building production bundle..."
NODE_ENV=$NODE_ENV npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -f "dist/server.cjs" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - missing required files"
    exit 1
fi

# Setup PM2
echo ""
echo "🚀 Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process
pm2 stop "$APP_NAME" || true
pm2 delete "$APP_NAME" || true

# Start application
echo "🚀 Starting application..."
pm2 start dist/server.cjs \
    --name "$APP_NAME" \
    --env NODE_ENV=$NODE_ENV \
    --env PORT=$PORT \
    --instances 1 \
    --exec-mode fork \
    --watch false

# Save PM2 configuration
pm2 save
pm2 startup

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "Application is running on port: $PORT"
echo "Logs: pm2 logs $APP_NAME"
echo "Monitor: pm2 monit"
echo "Status: pm2 status"
echo ""
echo "Configure Nginx to proxy requests to localhost:$PORT"
echo "=========================================="
