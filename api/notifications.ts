import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Default notification
const defaultNotifications = [
  { 
    id: "not-1", 
    title: "TitipMart Aktif 🏆", 
    message: "Sistem pusat TitipMart berjalan dalam mode produksi handal.", 
    type: "system", 
    time: "Baru saja" 
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
      return res.status(200).json(defaultNotifications);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[Notifications Error]', error);
        return res.status(200).json(defaultNotifications);
      }

      return res.status(200).json(notifications || defaultNotifications);

    } else if (req.method === 'POST') {
      const { title, message, type } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          error: 'title and message are required'
        });
      }

      const { data: newNotif, error } = await supabase
        .from('notifications')
        .insert([
          {
            title,
            message,
            type: type || 'system',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Notification Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newNotif?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Notifications Handler Error]', err);
    return res.status(200).json(defaultNotifications);
  }
}
