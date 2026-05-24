import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://psnamifiadsvvpmetfyv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const defaultStores = [
  {
    id: "neon-labs",
    name: "Neon Labs Store",
    logo: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
    description: "Store resmi Neon Labs - penjual terpercaya elektronik premium",
    rating: 4.9,
    totalProducts: 2,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "fashion-hub",
    name: "Fashion Hub Indonesia",
    logo: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
    description: "Koleksi fashion terlengkap dan terpercaya",
    rating: 4.7,
    totalProducts: 50,
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "beauty-store",
    name: "Beauty & Cosmetics Store",
    logo: "https://images.unsplash.com/photo-1596462502278-af־3514b3dba",
    description: "Kosmetik dan produk kecantikan original",
    rating: 4.8,
    totalProducts: 100,
    verified: true,
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseAnonKey) {
      return res.status(200).json(defaultStores);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Stores Error]', error);
        return res.status(200).json(defaultStores);
      }

      return res.status(200).json(stores || defaultStores);

    } else if (req.method === 'POST') {
      const { name, logo, description, sellerId } = req.body;

      if (!name || !sellerId) {
        return res.status(400).json({
          error: 'name and sellerId are required'
        });
      }

      const { data: newStore, error } = await supabase
        .from('stores')
        .insert([
          {
            seller_id: sellerId,
            name,
            logo,
            description,
            rating: 0,
            total_products: 0,
            verified: false,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Store Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newStore?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Stores Handler Error]', err);
    return res.status(200).json(defaultStores);
  }
}
