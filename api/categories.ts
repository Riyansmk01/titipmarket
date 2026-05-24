import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://psnamifiadsvvpmetfyv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Default categories fallback
const defaultCategories = [
  { id: "tech", name: "Gadgets & Electronics", icon: "Cpu", bgGradient: "from-amber-500 to-orange-600" },
  { id: "wear", name: "Fashion & Apparel", icon: "Shirt", bgGradient: "from-blue-500 to-indigo-600" },
  { id: "cosmetic", name: "Cosmetics & Beauty", icon: "Sparkles", bgGradient: "from-purple-500 to-pink-600" },
  { id: "living", name: "Home & Personal Care", icon: "Home", bgGradient: "from-teal-500 to-emerald-600" }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseAnonKey) {
      // Return default categories
      return res.status(200).json(defaultCategories);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      // Fetch categories from database
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.error('[Categories Error]', error);
        // Fallback to default categories
        return res.status(200).json(defaultCategories);
      }

      return res.status(200).json(categories || defaultCategories);

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Categories Handler Error]', err);
    // Always return at least default categories
    return res.status(200).json(defaultCategories);
  }
}
