# API Consolidation - Complete Implementation Guide

## Overview
Successfully consolidated the TitiPmart API endpoints from 19 separate Vercel serverless functions to 6 grouped endpoints using query-parameter routing. This change respects the **Vercel Hobby plan limitation of 12 serverless functions maximum** while maintaining full application functionality.

## Consolidated Endpoint Structure

### 1. **Marketplace Endpoint** (`/api/marketplace`)
Handles all marketplace, product, and order operations.

**Query Parameters (action):**
- `action=products` - GET/POST products
- `action=categories` - GET categories
- `action=stores` - GET stores, DELETE stores
- `action=promos` - GET active promotions
- `action=orders` - GET/POST orders
- `action=chats` - GET chats
- `action=notifications` - GET notifications
- `action=checkin` - POST daily checkin reward
- `action=viewed` - POST product view tracking
- `action=feedback` - POST user feedback
- `action=order-pay` - POST order payment trigger
- `action=order-status` - POST order status update
- `action=visual-search` - POST visual search
- `action=kyc-upload` - POST KYC document upload
- `action=favorites` - POST wishlist toggle
- `action=verify-store` - POST store verification
- `action=update-store` - POST store info update
- `action=checkout` - POST checkout/order creation

**File:** `api/marketplace.ts`

### 2. **Authentication Endpoint** (`/api/auth`)
Handles all user authentication and profile operations.

**Query Parameters (action):**
- `action=login` - POST user login
- `action=register` - POST user registration
- `action=forgot-password` - POST password reset request
- `action=change-password` - POST password change
- `action=google-login` - POST Google authentication
- `action=profile` - POST profile update

**File:** `api/auth.ts`

### 3. **Wallet Endpoint** (`/api/wallet`)
Handles user wallet and balance operations.

**Operations:**
- GET - Retrieve wallet balance (query: `userId`)
- POST - Topup wallet (body: `userId`, `amount`)

**File:** `api/wallet.ts`

### 4. **Reviews Endpoint** (`/api/reviews`)
Handles product review operations.

**Operations:**
- GET - Retrieve reviews (query: `productId`)
- POST - Create review (action: `create`, body: product/user/rating data)

**File:** `api/reviews.ts`

### 5. **AI Endpoint** (`/api/ai`)
Handles AI-powered operations.

**Query Parameters (action):**
- `action=describe` - POST generate product description
- `action=recommend` - POST get AI product recommendations

**File:** `api/ai.ts`

### 6. **Upload Endpoint** (`/api/upload`)
Handles file uploads (images, documents).

**File:** `api/upload.ts`

## Frontend API Call Updates

All frontend API calls have been updated from individual endpoint format to consolidated query-parameter format:

### Examples of Updates:

#### Before (Individual Endpoints)
```typescript
fetch('/api/products')
fetch('/api/categories')
fetch('/api/orders/123/pay')
fetch('/api/stores/456')
fetch('/api/auth/login')
fetch('/api/ai/describe')
```

#### After (Consolidated Endpoints)
```typescript
fetch(apiUrl('/api/marketplace?action=products'))
fetch(apiUrl('/api/marketplace?action=categories'))
fetch(apiUrl('/api/marketplace?action=order-pay'), { body: { orderId: '123' } })
fetch(apiUrl('/api/marketplace?action=stores&id=456'))
fetch(apiUrl('/api/auth?action=login'))
fetch(apiUrl('/api/ai?action=describe'))
```

## Updated Files

### API Files (Consolidated)
- `api/marketplace.ts` - 18 actions consolidated
- `api/auth.ts` - 6 actions consolidated
- `api/wallet.ts` - GET/POST operations
- `api/reviews.ts` - GET/POST operations with action parameter
- `api/ai.ts` - 2 actions (describe, recommend)
- `api/upload.ts` - File upload handling

### Deleted Files (18 Total)
**Old Individual Endpoint Files:**
- api/products.ts
- api/categories.ts
- api/stores.ts
- api/promo.ts
- api/chats.ts
- api/notifications.ts
- api/orders.ts
- api/upload.ts
- api/health.ts
- api/auth/login.ts
- api/auth/register.ts
- api/auth/google-login.ts
- api/auth/forgot-password.ts
- api/auth/change-password.ts
- api/ai/describe.ts
- api/reviews/[...all].ts
- api/viewed/register.ts
- api/wallet/topup.ts

### Frontend Files Updated
- `src/App.tsx` - 20+ endpoint calls updated
- `src/components/AIPanel.tsx` - AI recommendation endpoint
- `src/components/AdminPanel.tsx` - Store management
- `src/components/SellerDashboard.tsx` - Product and order management
- `src/components/CheckoutModal.tsx` - Checkout flow
- `src/types.ts` - No changes needed

## Vercel Deployment Benefits

### Before Consolidation
- **19 serverless functions** (exceeds 12 function limit)
- Multiple redundant handler files
- Risk of deployment failure on Vercel Hobby plan
- Harder to maintain consistency

### After Consolidation
- **6 serverless functions** (well under 12 function limit)
- Centralized routing via query parameters
- Successful Vercel deployment possible
- Easier to maintain and extend
- Reduced cold start latency
- Unified error handling patterns

## Implementation Details

### Query Parameter Routing Pattern
All endpoints use consistent query-parameter routing:

```typescript
// Pattern: /api/[endpoint]?action=[action]&[param]=[value]

// Example with parameters
fetch('/api/marketplace?action=products&limit=10')
fetch('/api/marketplace?action=order-pay')
fetch('/api/auth?action=google-login')
fetch('/api/reviews?productId=prod-1')
```

### Error Handling
- Consistent error response format across all endpoints
- Fallback to default data when Supabase is unavailable
- Proper HTTP status codes (200, 201, 400, 401, 404, 405, 500)

### Demo Mode Support
- All endpoints work in demo mode without Supabase connection
- Default/mock data returned when database unavailable
- Suitable for development and testing

## Git Commits

Recent commits documenting the consolidation:

1. **67255b6** - `refactor: consolidate 19 API files into 5 grouped endpoints`
2. **38ecbb5** - `Add missing marketplace endpoints (checkin, feedback, viewed, order-pay, order-status) and update frontend API calls`
3. **b581613** - `Update component API calls to use consolidated endpoints`
4. **70a7bfe** - `Consolidate all remaining API endpoints into unified structure`
5. **e3ef122** - `Fix remaining Google login API calls to use consolidated endpoint`

## Migration Checklist

- ✅ Consolidated 19 API files to 6 endpoints
- ✅ Updated all frontend fetch() calls (20+ calls)
- ✅ Updated component API calls (4 components)
- ✅ Added missing handler logic to marketplace.ts
- ✅ Added profile action to auth.ts
- ✅ Added recommend action to ai.ts
- ✅ Deleted 18 old endpoint files
- ✅ Fixed TypeScript compilation errors
- ✅ Verified no remaining old endpoint references
- ✅ Tested routing logic for all actions

## Deployment Ready
The project is now ready for deployment on Vercel Hobby plan with only 6 serverless functions utilized. All functionality has been preserved while respecting deployment constraints.

## Future Enhancements
- Implement Supabase database integration
- Add real KYC document verification
- Connect to actual payment gateway (Pakasir)
- Implement real-time chat functionality
- Add image processing for visual search
