import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://psnamifiadsvvpmetfyv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      // Fetch all chat messages
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Chats Error]', error);
        // Fallback to empty array if table doesn't exist
        return res.status(200).json([]);
      }

      return res.status(200).json(chats || []);

    } else if (req.method === 'POST') {
      // Create new chat message
      const { senderId, senderName, receiverId, message, isCS } = req.body;

      if (!senderId || !message) {
        return res.status(400).json({
          error: 'senderId and message are required'
        });
      }

      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([
          {
            sender_id: senderId,
            sender_name: senderName,
            receiver_id: receiverId,
            message,
            is_cs: isCS || false,
            read: false,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Chat Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newChat?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Chats Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
