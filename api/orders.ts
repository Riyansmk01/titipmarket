import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const defaultOrders: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseAnonKey) {
      return res.status(200).json(defaultOrders);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      // Fetch all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Orders Error]', error);
        return res.status(200).json(defaultOrders);
      }

      return res.status(200).json(orders || []);

    } else if (req.method === 'POST') {
      // Create new order
      const { buyerId, buyerName, shippingAddress, courier, items, totalPrice, promoCode } = req.body;

      if (!items || items.length === 0 || !buyerName) {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      let finalPrice = totalPrice;

      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: buyerId,
            buyer_name: buyerName,
            shipping_address: shippingAddress,
            courier,
            items,
            total_price: finalPrice,
            promo_code: promoCode,
            status: 'unpaid',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Order Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newOrder?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Orders Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
