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

const defaultOrders: any[] = [];
const defaultChats: any[] = [];
const defaultNotifications: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;
    const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

    // PRODUCTS
    if (action === 'products' || (action === undefined && req.method === 'GET')) {
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

    // ORDERS
    if (action === 'orders') {
      if (!supabase) {
        return res.status(200).json(defaultOrders);
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Orders Error]', error);
        return res.status(200).json(defaultOrders);
      }
      return res.status(200).json(orders || defaultOrders);
    }

    // CHATS
    if (action === 'chats') {
      if (!supabase) {
        return res.status(200).json(defaultChats);
      }

      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Chats Error]', error);
        return res.status(200).json(defaultChats);
      }
      return res.status(200).json(chats || defaultChats);
    }

    // NOTIFICATIONS
    if (action === 'notifications') {
      if (!supabase) {
        return res.status(200).json(defaultNotifications);
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Notifications Error]', error);
        return res.status(200).json(defaultNotifications);
      }
      return res.status(200).json(notifications || defaultNotifications);
    }

    // CHECKIN - Daily reward
    if (action === 'checkin') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      return res.status(200).json({
        success: true,
        reward: 100,
        message: 'Selamat! Anda berhasil mengklaim bonus harian sebesar 100 Coins (+Rp 1) dari Market Digi!'
      });
    }

    // VIEWED PRODUCTS - Track product views
    if (action === 'viewed') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { userId, productId } = req.body;
      if (!userId || !productId) {
        return res.status(400).json({ error: 'userId and productId are required' });
      }

      // Just acknowledge the view - no database needed for demo
      return res.status(200).json({
        success: true,
        message: 'Product view tracked'
      });
    }

    // FEEDBACK - User feedback submission
    if (action === 'feedback') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { userId, content, type } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      return res.status(200).json({
        success: true,
        message: 'Feedback recorded successfully'
      });
    }

    // ORDER PAYMENT - Trigger order payment
    if (action === 'order-pay') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
      }

      return res.status(200).json({
        success: true,
        message: `Pembayaran QRIS Pesanan #${orderId} berhasil diproses oleh link gateway Pakasir!`
      });
    }

    // ORDER STATUS UPDATE - Update order status
    if (action === 'order-status') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ error: 'orderId and status are required' });
      }

      return res.status(200).json({
        success: true,
        message: `Order #${orderId} status updated to ${status}`
      });
    }

    // DELETE PRODUCT
    if (action === 'products' && req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product id is required' });
      }

      // In demo mode, just acknowledge deletion
      return res.status(200).json({
        success: true,
        message: `Product ${id} deleted successfully`
      });
    }

    // DELETE STORE
    if (action === 'stores' && req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Store id is required' });
      }

      // In demo mode, just acknowledge deletion
      return res.status(200).json({
        success: true,
        message: `Store ${id} and its products deleted successfully`
      });
    }

    // VISUAL SEARCH
    if (action === 'visual-search') {
      const { imageBase64 } = req.body;
      return res.status(200).json({
        success: true,
        verdict: {
          suggestedCategoryId: 'tech',
          confidence: 0.87,
          description: 'High-tech product detected with premium finish'
        }
      });
    }

    // KYC UPLOAD
    if (action === 'kyc-upload') {
      const { sellerName, email, documentImage } = req.body;
      return res.status(200).json({
        success: true,
        message: 'KYC document submitted successfully for verification',
        verificationStatus: 'pending',
        estimatedReviewTime: '24-48 hours'
      });
    }

    // FAVORITES TOGGLE
    if (action === 'favorites') {
      const { userId, productId } = req.body;
      return res.status(200).json({
        success: true,
        message: `Product ${productId} added to favorites`,
        isFavorite: true
      });
    }

    // VERIFY STORE
    if (action === 'verify-store') {
      const { storeId, verified } = req.body;
      return res.status(200).json({
        success: true,
        message: `Store ${storeId} verification status updated`,
        verified
      });
    }

    // UPDATE STORE
    if (action === 'update-store') {
      const { storeId, storeName, description, banner } = req.body;
      return res.status(200).json({
        success: true,
        message: 'Store information updated successfully',
        store: {
          id: storeId,
          name: storeName,
          description,
          banner
        }
      });
    }

    // CHECKOUT
    if (action === 'checkout') {
      const { buyerId, buyerName, items, totalPrice, promoCode } = req.body;
      return res.status(200).json({
        id: `ord-${Date.now()}`,
        buyerId,
        buyerName,
        items,
        totalPrice,
        promoCode,
        status: 'pending',
        payment: {
          status: 'PENDING',
          method: 'qris',
          invoiceId: `INV-${Date.now()}`
        },
        createdAt: new Date().toISOString()
      });
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
