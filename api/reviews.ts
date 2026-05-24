import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Reviews] Missing Supabase credentials');
      return res.status(200).json([]);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // GET REVIEWS
    if (req.method === 'GET') {
      const { productId } = req.query;

      let query = supabase.from('reviews').select('*');

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data: reviews, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('[Reviews Error]', error);
        return res.status(200).json([]);
      }

      return res.status(200).json(reviews || []);
    }

    // POST REVIEW
    if (req.method === 'POST') {
      const { productId, userId, rating, title, comment } = req.body;

      if (!productId || !userId || !rating) {
        return res.status(400).json({
          error: 'productId, userId, and rating are required'
        });
      }

      try {
        const { data: newReview, error } = await supabase
          .from('reviews')
          .insert([
            {
              product_id: productId,
              user_id: userId,
              rating,
              title,
              comment,
              created_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) {
          console.error('[Create Review Error]', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(newReview?.[0] || {});
      } catch (dbErr) {
        console.error('[Review POST Error]', dbErr);
        return res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'production' ? undefined : (dbErr as any)?.message
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err: any) {
    console.error('[Reviews Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
