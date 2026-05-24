import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Default data
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

const defaultCategories = [
  { id: "tech", name: "Gadgets & Electronics", icon: "Cpu", bgGradient: "from-amber-500 to-orange-600" },
  { id: "wear", name: "Fashion & Apparel", icon: "Shirt", bgGradient: "from-blue-500 to-indigo-600" },
  { id: "cosmetic", name: "Cosmetics & Beauty", icon: "Sparkles", bgGradient: "from-purple-500 to-pink-600" },
  { id: "living", name: "Home & Personal Care", icon: "Home", bgGradient: "from-teal-500 to-emerald-600" }
];

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
  }
];

const defaultPromos = [
  {
    id: "promo-1",
    code: "WELCOME50",
    discount: 50000,
    description: "Welcome discount untuk user baru",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
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
    const { action } = req.query;
    const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

    // PRODUCTS
    if (action === 'products' || action === undefined && req.path === '/api/marketplace' && req.method === 'GET') {
      if (!supabase) {
        return res.status(200).json(defaultProducts);
      }

      if (req.method === 'GET') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .limit(100);

        if (error) {
          console.error('[Products Error]', error);
          return res.status(200).json(defaultProducts);
        }
        return res.status(200).json(products || defaultProducts);

      } else if (req.method === 'POST') {
        const { title, description, price, stock, categoryId, images, threeDMeta, sellerId } = req.body;

        if (!title || !price || !categoryId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([{ title, description, price, stock: stock || 0, category_id: categoryId, images, three_d_meta: threeDMeta, seller_id: sellerId || 'neon-labs', created_at: new Date().toISOString() }])
          .select();

        if (error) {
          console.error('[Create Product Error]', error);
          return res.status(500).json({ error: error.message });
        }
        return res.status(201).json(newProduct?.[0] || {});
      }
    }

    // CATEGORIES
    if (action === 'categories') {
      if (!supabase) {
        return res.status(200).json(defaultCategories);
      }

      const { data: categories, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('[Categories Error]', error);
        return res.status(200).json(defaultCategories);
      }
      return res.status(200).json(categories || defaultCategories);
    }

    // STORES
    if (action === 'stores') {
      if (!supabase) {
        return res.status(200).json(defaultStores);
      }

      const { data: stores, error } = await supabase
        .from('stores')
        .select('*');

      if (error) {
        console.error('[Stores Error]', error);
        return res.status(200).json(defaultStores);
      }
      return res.status(200).json(stores || defaultStores);
    }

    // PROMOS
    if (action === 'promos') {
      if (!supabase) {
        return res.status(200).json(defaultPromos);
      }

      const { data: promos, error } = await supabase
        .from('promos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Promos Error]', error);
        return res.status(200).json(defaultPromos);
      }
      return res.status(200).json(promos || defaultPromos);
    }

    return res.status(400).json({ error: 'Invalid action parameter' });

  } catch (err: any) {
    console.error('[Marketplace Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
