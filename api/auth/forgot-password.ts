import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Forgot Password Endpoint
 * POST /api/auth/forgot-password
 */

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email harus diisi'
      });
    }

    // Simulate password reset
    console.log(`[Forgot Password] Password reset requested for ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.',
      resetLink: `https://www.marketdigi.me/reset-password?token=mock-token-${Date.now()}`
    });

  } catch (err: any) {
    console.error('[Forgot Password Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
}
