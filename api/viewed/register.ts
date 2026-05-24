import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Viewed Products Tracking
 * POST /api/viewed/register - Track product view
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
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        error: 'userId and productId are required'
      });
    }

    // Log view for analytics
    console.log(`[View Tracking] User ${userId} viewed product ${productId}`);

    return res.status(200).json({
      success: true,
      message: 'Product view tracked'
    });

  } catch (err: any) {
    console.error('[Viewed Tracking Error]', err);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
