#!/bin/bash
# Quick Verification Script for TitipMart API Endpoints

echo "🔍 TitipMart API Verification Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="${1:-https://www.marketdigi.me}"

echo "Target Domain: $DOMAIN"
echo ""

# Test Health Endpoint
echo -n "1. Testing Health Endpoint... "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/health")
if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $HEALTH)${NC}"
fi

# Test Login Endpoint
echo -n "2. Testing Login Endpoint... "
LOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$DOMAIN/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}')
if [ "$LOGIN" = "401" ] || [ "$LOGIN" = "400" ] || [ "$LOGIN" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $LOGIN)${NC}"
fi

# Test Products Endpoint
echo -n "3. Testing Products Endpoint... "
PRODUCTS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/products")
if [ "$PRODUCTS" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $PRODUCTS)${NC}"
fi

# Test Categories Endpoint
echo -n "4. Testing Categories Endpoint... "
CATEGORIES=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/categories")
if [ "$CATEGORIES" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $CATEGORIES)${NC}"
fi

# Test Orders Endpoint
echo -n "5. Testing Orders Endpoint... "
ORDERS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/orders")
if [ "$ORDERS" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $ORDERS)${NC}"
fi

# Test Chats Endpoint
echo -n "6. Testing Chats Endpoint... "
CHATS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/chats")
if [ "$CHATS" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $CHATS)${NC}"
fi

# Test Stores Endpoint
echo -n "7. Testing Stores Endpoint... "
STORES=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/stores")
if [ "$STORES" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $STORES)${NC}"
fi

# Test Notifications Endpoint
echo -n "8. Testing Notifications Endpoint... "
NOTIFS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/notifications")
if [ "$NOTIFS" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $NOTIFS)${NC}"
fi

# Test Promos Endpoint
echo -n "9. Testing Promos Endpoint... "
PROMOS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/promo")
if [ "$PROMOS" = "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $PROMOS)${NC}"
fi

# Test 404 Endpoint
echo -n "10. Testing 404 Endpoint (should fail)... "
NOTFOUND=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/nonexistent")
if [ "$NOTFOUND" = "404" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ (Status: $NOTFOUND)${NC}"
fi

echo ""
echo "✅ Verification Complete!"
echo ""
echo "Usage:"
echo "  ./verify-api.sh                          # Test production"
echo "  ./verify-api.sh http://localhost:3000    # Test local dev"
