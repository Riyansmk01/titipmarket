import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Fallback endpoints for missing features
 * GET /api/reviews/:productId - Get product reviews
 * GET /api/products/similar/:productId - Get similar products
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return empty arrays for now as fallback
  return res.status(200).json([]);
}
