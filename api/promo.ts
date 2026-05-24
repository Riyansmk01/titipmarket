import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!supabaseAnonKey) {
      return res.status(200).json([]);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (req.method === 'GET') {
      // Fetch active promos
      const { data: promos, error } = await supabase
        .from('promos')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Promos Error]', error);
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
        return res.status(200).json(defaultPromos);
      }

      return res.status(200).json(promos || []);

    } else if (req.method === 'POST') {
      const { code, discount, description, expiresAt } = req.body;

      if (!code || !discount) {
        return res.status(400).json({
          error: 'code and discount are required'
        });
      }

      const { data: newPromo, error } = await supabase
        .from('promos')
        .insert([
          {
            code: code.toUpperCase(),
            discount,
            description,
            expires_at: expiresAt,
            active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('[Create Promo Error]', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(newPromo?.[0] || {});

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err: any) {
    console.error('[Promos Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
