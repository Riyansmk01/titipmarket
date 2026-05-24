import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory user store for demo (replace with Supabase in production)
const users = [
  {
    id: 'user-1',
    email: 'reza@marketdigi.me',
    password: 'sandi123',
    username: 'Reza Pratama',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password harus diisi'
      });
    }

    // Find user in memory
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Email atau password salah'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        walletBalance: 0,
        tier: 'BRONZE',
        kycVerified: false,
        coins: 0
      }
    });

  } catch (err: any) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
