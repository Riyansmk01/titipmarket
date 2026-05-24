import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AI Product Description Generator
 * POST /api/ai/describe
 * Uses Gemini or other AI models to generate product descriptions
 */

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
    const { productName, categoryName } = req.body;

    if (!productName) {
      return res.status(400).json({
        error: 'productName is required'
      });
    }

    // Generate mock AI description
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

  } catch (err: any) {
    console.error('[AI Describe Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}
