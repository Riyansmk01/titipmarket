import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server';

/**
 * Catch-all handler for all API routes
 * Routes all requests to the Express app as middleware
 */
export default (req: VercelRequest, res: VercelResponse) => {
  // Set proper Content-Type if not already set
  if (!res.getHeader('Content-Type')) {
    res.setHeader('Content-Type', 'application/json');
  }

  return new Promise<void>((resolve) => {
    // Use Express app as middleware
    app(req as any, res as any);
    
    // Resolve when response is finished
    const onFinish = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);
      resolve();
    };
    
    res.on('finish', onFinish);
    res.on('close', onFinish);
    
    // Safety timeout
    setTimeout(() => {
      if (!res.writableEnded) {
        res.removeListener('finish', onFinish);
        res.removeListener('close', onFinish);
        if (!res.headersSent) {
          res.status(408).json({ error: 'Request timeout' });
        }
        resolve();
      }
    }, 25000);
  });
};
