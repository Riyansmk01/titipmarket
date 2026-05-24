import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.query;

    // RECOMMEND PRODUCTS
    if (action === 'recommend') {
      const { query, userPreferences } = req.body;

      if (!query) {
        return res.status(400).json({
          error: 'query is required'
        });
      }

      return res.status(200).json({
        success: true,
        smartAdvice: `For "${query}", we recommend products with premium quality, reliable performance, and excellent customer reviews. ${userPreferences ? 'Based on your preferences: ' + userPreferences : ''}`,
        recommendations: [
          {
            id: 'rec-1',
            title: 'Premium ' + query,
            price: 999000,
            categoryId: 'tech',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
            rating: 4.8,
            aiReason: 'Top rated for ' + query
          },
          {
            id: 'rec-2',
            title: 'Professional ' + query,
            price: 1499000,
            categoryId: 'tech',
            images: ['https://images.unsplash.com/photo-1522869635100-ce87fcf69808'],
            rating: 4.7,
            aiReason: 'Most recommended for ' + query
          }
        ]
      });
    }

    // DESCRIBE PRODUCT
    if (action === 'describe') {
      const { productName, categoryName } = req.body;

      if (!productName) {
        return res.status(400).json({
          error: 'productName is required'
        });
      }

      const descriptions: { [key: string]: string } = {
        tech: `${productName} adalah perangkat teknologi terdepan yang dirancang dengan inovasi terkini. Dilengkapi dengan fitur-fitur canggih untuk meningkatkan produktivitas Anda.`,
        wear: `${productName} adalah pilihan fashion terbaik dengan desain eksklusif. Material berkualitas premium memberikan kenyamanan maksimal sepanjang hari.`,
        cosmetic: `${productName} adalah produk kecantikan terpercaya dengan formula aman. Cocok untuk semua jenis kulit dan memberikan hasil nyata.`,
        living: `${productName} adalah solusi lengkap untuk kebutuhan sehari-hari. Produk berkualitas tinggi dengan harga terjangkau.`
      };

      const category = categoryName || 'tech';
      const description = descriptions[category] || descriptions.tech;

      return res.status(200).json({
        success: true,
        title: productName,
        description: description,
        bulletPoints: [
          `✓ Kualitas premium dan terjangkau`,
          `✓ Garansi resmi 1 tahun`,
          `✓ Gratis ongkir ke seluruh Indonesia`,
          `✓ Metode pembayaran fleksibel`
        ],
        threeDMeta: {
          rotateX: 10,
          rotateY: -10,
          translateZ: 15,
          scale: 1.04,
          glowColor: 'rgba(255, 122, 0, 0.4)'
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action parameter' });

  } catch (err: any) {
    console.error('[AI Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
