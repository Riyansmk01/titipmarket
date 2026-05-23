/// <reference types="vite/client" />
/**
 * API Configuration Utility
 * Provides the correct API base URL based on environment
 */

export const getApiBaseUrl = (): string => {
  // Use VITE_API_URL from environment, fallback to relative path for production
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  
  // In production, use relative path (Vercel will handle routing)
  // In development without env var, default to localhost:3000
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  
  // Production: use relative path for same-origin requests
  return '';
};

export const apiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
};
