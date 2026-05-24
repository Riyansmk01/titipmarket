import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://psnamifiadsvvpmetfyv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseAnonKey) {
      return res.status(500).json({
        error: 'Supabase not configured',
        message: 'VITE_SUPABASE_ANON_KEY is missing'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      // Fetch all products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(100);

      if (error) {
        console.error('[Products Error]', error);
        // Fallback to empty array if table doesn't exist
        return res.status(200).json([]);
      }

      return res.status(200).json(products || []);

    } else if (req.method === 'POST') {
      // Create new product (requires auth)
      const { title, description, price, stock, categoryId, images, threeDMeta, sellerId } = req.body;

      if (!title || !price || !categoryId) {
        return res.status(400).json({
          error: 'Missing required fields: title, price, categoryId'
        });
      }

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([
          {
            title,
            description,
            price,
            stock: stock || 0,
            category_id: categoryId,
            images,
            three_d_meta: threeDMeta,
            seller_id: sellerId || 'neon-labs',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Product Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newProduct?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Products Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
