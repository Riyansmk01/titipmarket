import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint - test if API routing works on Vercel
 * GET https://www.marketdigi.me/api/health
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const nodeEnv = process.env.NODE_ENV || 'not-set';
    const envVarsStatus = {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      NVIDIA_API_KEY: !!process.env.NVIDIA_API_KEY,
      MISTRAL_API_KEY: !!process.env.MISTRAL_API_KEY,
      VITE_GOOGLE_CLIENT_ID: !!process.env.VITE_GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      PAKASIR_API_KEY: !!process.env.PAKASIR_API_KEY,
    };

    const allEnvVarsLoaded = Object.values(envVarsStatus).every(v => v === true);

    res.status(200).json({
      status: 'OK',
      message: 'TitipMart API Routing Works ✅',
      timestamp: new Date().toISOString(),
      environment: nodeEnv,
      allEnvironmentVariablesLoaded: allEnvVarsLoaded,
      environmentVariables: envVarsStatus,
      nextSteps: allEnvVarsLoaded 
        ? 'All env vars loaded! Test: https://www.marketdigi.me/api/products'
        : 'Set environment variables in Vercel Dashboard > Settings > Environment Variables'
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'ERROR',
      message: err?.message || 'Health check failed',
      error: process.env.NODE_ENV === 'production' ? 'Server error' : err?.toString()
    });
  }
}
