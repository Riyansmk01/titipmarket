import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Change Password Endpoint
 * POST /api/auth/change-password
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
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password baru harus diisi'
      });
    }

    // Simulate password change
    console.log(`[Change Password] Password changed for ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (err: any) {
    console.error('[Change Password Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan server'
    });
  }
}
