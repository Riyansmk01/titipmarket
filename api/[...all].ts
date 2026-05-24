import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Catch-all handler for unknown API routes
 * Returns 404 for routes not explicitly defined
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(404).json({ 
    error: 'API route not found',
    path: req.url,
    method: req.method
  });
};
