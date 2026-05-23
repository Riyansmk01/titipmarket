#!/bin/bash

# TitipMart Production Diagnostics Script
# Run this on your production server to verify environment setup

echo "================================"
echo "TitipMart Production Diagnostics"
echo "================================"
echo ""

# Check if Node is running
echo "1. Checking if Node.js server is running..."
if pgrep -f "node.*server" > /dev/null; then
    echo "   ✓ Node.js process found"
    ps aux | grep "node.*server" | grep -v grep
else
    echo "   ✗ Node.js process NOT found"
    echo "   Start server with: pm2 start ecosystem.config.js"
fi
echo ""

# Check if listening on port
echo "2. Checking if port 3000 is listening..."
if netstat -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "   ✓ Port 3000 is listening"
    netstat -tlnp 2>/dev/null | grep ":3000"
else
    echo "   ✗ Port 3000 is NOT listening"
    echo "   Check if firewall is blocking or port is in use"
fi
echo ""

# Check environment variables
echo "3. Checking environment variables..."
echo "   NODE_ENV: ${NODE_ENV:-NOT SET}"
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "   ✓ GEMINI_API_KEY is set"
else
    echo "   ✗ GEMINI_API_KEY is NOT set"
fi
if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "   ✓ OPENAI_API_KEY is set"
else
    echo "   ✗ OPENAI_API_KEY is NOT set"
fi
if [ ! -z "$GROQ_API_KEY" ]; then
    echo "   ✓ GROQ_API_KEY is set"
else
    echo "   ✗ GROQ_API_KEY is NOT set"
fi
if [ ! -z "$MISTRAL_API_KEY" ]; then
    echo "   ✓ MISTRAL_API_KEY is set"
else
    echo "   ✗ MISTRAL_API_KEY is NOT set"
fi
if [ ! -z "$NVIDIA_API_KEY" ]; then
    echo "   ✓ NVIDIA_API_KEY is set"
else
    echo "   ✗ NVIDIA_API_KEY is NOT set"
fi
if [ ! -z "$PAKASIR_API_KEY" ]; then
    echo "   ✓ PAKASIR_API_KEY is set"
else
    echo "   ✗ PAKASIR_API_KEY is NOT set"
fi
echo ""

# Check if server responds
echo "4. Testing API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/notifications)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✓ API returned HTTP 200"
else
    echo "   ✗ API returned HTTP $RESPONSE"
    echo "   Full response:"
    curl -i http://localhost:3000/api/notifications 2>/dev/null | head -20
fi
echo ""

# Check server logs
echo "5. Recent server logs..."
if command -v pm2 &> /dev/null; then
    echo "   [PM2 Logs]"
    pm2 logs --nostream | tail -5
elif command -v journalctl &> /dev/null; then
    echo "   [Systemd Logs]"
    journalctl -u titipmart -n 5 --no-pager
else
    echo "   ? Could not find PM2 or systemd logs"
fi
echo ""

echo "================================"
echo "Diagnostics Complete"
echo "================================"
