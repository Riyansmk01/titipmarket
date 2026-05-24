import { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory user store (replace with Supabase in production)
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
    const { action } = req.query;

    // LOGIN
    if (action === 'login') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email dan password harus diisi'
        });
      }

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
    }

    // REGISTER
    if (action === 'register') {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email, dan password harus diisi'
        });
      }

      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email sudah terdaftar'
        });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        password,
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
    }

    // FORGOT PASSWORD
    if (action === 'forgot-password') {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email harus diisi'
        });
      }

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Email tidak ditemukan'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Email reset password sudah dikirim',
        resetToken: `token-${Date.now()}`
      });
    }

    // CHANGE PASSWORD
    if (action === 'change-password') {
      const { userId, oldPassword, newPassword } = req.body;

      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'userId, oldPassword, dan newPassword harus diisi'
        });
      }

      const user = users.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User tidak ditemukan'
        });
      }

      if (user.password !== oldPassword) {
        return res.status(401).json({
          success: false,
          error: 'Password lama salah'
        });
      }

      user.password = newPassword;

      return res.status(200).json({
        success: true,
        message: 'Password berhasil diubah'
      });
    }

    // GOOGLE LOGIN
    if (action === 'google-login') {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Google token harus diisi'
        });
      }

      // Mock verification
      return res.status(200).json({
        success: true,
        message: 'Login Google berhasil',
        user: {
          id: `google-${Date.now()}`,
          email: 'google.user@gmail.com',
          username: 'Google User',
          role: 'buyer',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde.jpg'
        }
      });
    }

    // PROFILE UPDATE
    if (action === 'profile') {
      const { id, username, email } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const user = users.find(u => u.id === id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User tidak ditemukan'
        });
      }

      // Update user profile
      if (username) user.username = username;
      if (email) user.email = email;

      return res.status(200).json({
        success: true,
        message: 'Profile berhasil diupdate',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action parameter' });

  } catch (err: any) {
    console.error('[Auth Handler Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
