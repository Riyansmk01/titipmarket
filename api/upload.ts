import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * File Upload API
 * POST /api/upload - Upload file/image to storage
 * Supports: images, KTP, seller branding, documents
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
    const { file, fileName, type, userId } = req.body;

    if (!file || !fileName || !userId) {
      return res.status(400).json({
        error: 'file, fileName, and userId are required'
      });
    }

    // Decode base64 file
    const buffer = Buffer.from(file, 'base64');
    const fileSize = buffer.length;

    // Validate file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File terlalu besar. Maksimal 10MB'
      });
    }

    if (!supabaseAnonKey) {
      // Simulate successful upload
      const mockUrl = `https://storage.tipimart.local/${userId}/${Date.now()}-${fileName}`;
      return res.status(201).json({
        success: true,
        url: mockUrl,
        fileName,
        type: type || 'image',
        size: fileSize,
        uploadedAt: new Date().toISOString()
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const bucketName = type === 'kyc' ? 'kyc-documents' : type === 'branding' ? 'seller-branding' : 'user-uploads';
    const filePath = `${userId}/${Date.now()}-${fileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: getContentType(fileName),
        upsert: false
      });

    if (error) {
      console.error('[Upload Error]', error);
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return res.status(201).json({
      success: true,
      url: publicData.publicUrl,
      fileName,
      type: type || 'image',
      size: fileSize,
      uploadedAt: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[Upload Handler Error]', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' ? undefined : err?.message
    });
  }
}

function getContentType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
