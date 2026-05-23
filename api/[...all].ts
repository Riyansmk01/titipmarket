import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server';

/**
 * Catch-all handler for all API routes
 * Routes all requests to the Express app
 */
export default (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve, reject) => {
    // Handle the request through Express
    app(req, res);
    
    // Resolve when response is finished
    res.on('finish', () => {
      resolve({});
    });
    
    res.on('error', (err) => {
      console.error('[API Handler Error]', err);
      reject(err);
    });
  });
};
