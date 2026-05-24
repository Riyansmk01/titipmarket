import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Wallet/Top-up Balance API
 * POST /api/wallet/topup - Top up balance
 * GET /api/wallet/:userId - Get user wallet balance
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required'
        });
      }

      if (!supabaseAnonKey) {
        // Return default wallet balance
        return res.status(200).json({
          userId,
          balance: 0,
          currency: 'IDR',
          lastUpdated: new Date().toISOString()
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !wallet) {
        return res.status(200).json({
          userId,
          balance: 0,
          currency: 'IDR',
          lastUpdated: new Date().toISOString()
        });
      }

      return res.status(200).json({
        userId,
        balance: wallet.balance || 0,
        currency: 'IDR',
        lastUpdated: wallet.updated_at || new Date().toISOString()
      });

    } else if (req.method === 'POST') {
      const { userId, amount, method, transactionId } = req.body;

      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({
          error: 'userId and amount (> 0) are required'
        });
      }

      if (!supabaseAnonKey) {
        // Simulate successful topup
        return res.status(201).json({
          success: true,
          message: `Top-up Rp ${amount.toLocaleString('id-ID')} berhasil!`,
          transactionId: transactionId || `TXN-${Date.now()}`,
          userId,
          amount,
          method: method || 'bank_transfer',
          status: 'success',
          timestamp: new Date().toISOString()
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      // Create wallet transaction
      const { data: transaction, error } = await supabase
        .from('wallet_transactions')
        .insert([
          {
            user_id: userId,
            type: 'topup',
            amount,
            method: method || 'bank_transfer',
            transaction_id: transactionId || `TXN-${Date.now()}`,
            status: 'success',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Wallet Topup Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({
        success: true,
        message: `Top-up Rp ${amount.toLocaleString('id-ID')} berhasil!`,
        transactionId: transaction?.[0]?.transaction_id || transactionId,
        userId,
        amount,
        status: 'success',
        timestamp: new Date().toISOString()
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Wallet Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
