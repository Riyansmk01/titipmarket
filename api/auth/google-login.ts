import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Google OAuth Login Endpoint
 * POST /api/auth/google-login
 * 
 * Handles Google OAuth token verification and user registration/login
 */

// In-memory user storage (replace with database in production)
let registeredUsers: any[] = [
  {
    id: "admin-riyan",
    username: "Perdhana Riyan",
    email: "perdhanariyan@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg",
    role: "admin",
    walletBalance: 0,
    tier: "BRONZE",
    favorites: [],
    recentlyViewed: [],
    kycVerified: true,
    coins: 0
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { email, username, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email Google tidak valid.'
      });
    }

    const isRiyan = email.toLowerCase() === 'perdhanariyan@gmail.com';
    
    // Find or create user
    let user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Register new user
      user = {
        id: `user-${Date.now()}`,
        username: username || email.split('@')[0],
        email: email.toLowerCase(),
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg',
        role: isRiyan ? 'admin' : 'buyer',
        walletBalance: 0,
        tier: 'BRONZE',
        favorites: [],
        recentlyViewed: [],
        kycVerified: isRiyan,
        coins: 0
      };
      registeredUsers.push(user);
      console.log(`[Google Login] New user registered: ${email}`);
    } else {
      // Update existing user
      if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
        user.avatar = avatar;
      }
      if (isRiyan) {
        user.role = 'admin';
        user.kycVerified = true;
      } else if (user.role === 'admin') {
        user.role = 'buyer';
      }
      console.log(`[Google Login] User logged in: ${email}`);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        walletBalance: user.walletBalance,
        tier: user.tier,
        kycVerified: user.kycVerified,
        coins: user.coins
      }
    });

  } catch (error: any) {
    console.error('[Google Login Error]', error);
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error during Google login'
        : error?.message || 'Unknown error'
    });
  }
}
