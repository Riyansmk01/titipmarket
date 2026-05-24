import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const defaultProducts = [
  {
    id: "prod-1",
    title: "Smartphone Premium",
    price: 4999000,
    description: "Smartphone flagship terbaru",
    categoryId: "tech",
    images: ["https://images.unsplash.com/photo-1511707267537-b85faf00021e"],
    stock: 15,
    rating: 4.8
  },
  {
    id: "prod-2",
    title: "Laptop Gaming",
    price: 8999000,
    description: "Laptop dengan RTX 4070",
    categoryId: "tech",
    images: ["https://images.unsplash.com/photo-1588621538326-bccc019a0f1c"],
    stock: 8,
    rating: 4.9
  }
];

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
      return res.status(200).json(defaultProducts);
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
        return res.status(200).json(defaultProducts);
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
