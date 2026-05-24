import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * User Registration Endpoint
 * POST /api/auth/register
 */

const users: any[] = [
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
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, dan password harus diisi'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email sudah terdaftar'
      });
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      password, // In production, hash this!
      username,
      role: role || 'buyer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });

  } catch (err: any) {
    console.error('[Register Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
}
