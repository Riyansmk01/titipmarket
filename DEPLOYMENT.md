# TitipMart Production Deployment Guide

Panduan lengkap untuk deploy aplikasi TitipMart ke domain production: **https://www.marketdigi.me/**

## 📋 Prerequisites

- Node.js v18+ 
- npm atau yarn
- Server/hosting dengan dukungan Node.js
- SSL certificate (untuk production domain)
- PM2 atau process manager serupa (recommended)

## 🔧 Production Configuration

### Environment Variables

File `.env.production` sudah dikonfigurasi dengan semua API keys yang dibutuhkan:

```env
PAKASIR_API_KEY=your_pakasir_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Key Configuration Updates

1. **Vite Build Configuration** (`vite.config.ts`)
   - Output directory: `dist`
   - Assets minified dengan terser
   - Asset fingerprinting untuk cache busting
   - Source maps untuk debugging

2. **Image Paths** 
   - Fixed dari `/src/assets/images/` → `/assets/images/` untuk production
   - 5 images utama sudah di-bundle:
     - `titipmart_logo_1779527060606.png`
     - `marketplace_hero_banner_1779528695181.png`
     - `exclusive_glasses_promo_1779528963521.png`
     - `default_store_banner_1779528712410.png`
     - `welcome_promo_card_1779529424669.png`

3. **Server Configuration** (`server.ts`)
   - Development mode: Vite middleware untuk HMR
   - Production mode: Static serve dari `dist` folder dengan SPA fallback
   - Port: 3000 (dapat diubah via environment variable)

## 🚀 Deployment Steps

### 1. Local Build & Test

```bash
# Install dependencies
npm install

# Build production
set NODE_ENV=production && npm run build

# Verify build output
ls dist/  # Should contain: index.html, assets/, images/, server.cjs
```

### 2. Upload to Production Server

```bash
# Copy entire project ke server
scp -r . user@marketdigi.me:/app/titipmart/

# OR menggunakan git
git clone <repo-url> /app/titipmart
cd /app/titipmart
```

### 3. Setup di Production Server

```bash
# Install production dependencies
npm install --production

# Atau jika menggunakan npm ci untuk consistency:
npm ci --production
```

### 4. Start dengan PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start aplikasi
pm2 start dist/server.cjs --name "titipmart" --env production

# Save config agar auto-restart saat server reboot
pm2 save
pm2 startup
```

### 5. Setup Reverse Proxy (Nginx)

```nginx
upstream titipmart_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name www.marketdigi.me marketdigi.me;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.marketdigi.me marketdigi.me;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/marketdigi.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marketdigi.me/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;
    gzip_min_length 1000;
    
    # Proxy ke Node.js server
    location / {
        proxy_pass http://titipmart_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static assets caching
    location ~ ^/(assets|images)/ {
        proxy_pass http://titipmart_backend;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d marketdigi.me -d www.marketdigi.me

# Auto-renewal (usually auto-configured)
sudo systemctl enable certbot.timer
```

## 📊 Multi-AI Fallback Features

Aplikasi menggunakan multi-AI fallover engine yang otomatis mengganti provider jika satu gagal:

1. **Gemini** (primary)
2. **OpenAI** (fallback)
3. **Groq** (fallback)
4. **Nvidia** (fallback)
5. **Mistral** (fallback)

Semua API keys sudah dikonfigurasi di `.env.production`.

## 🗂️ Project Structure di Production

```
dist/
├── index.html          # React app entry point
├── assets/
│   ├── index-*.css    # Bundled styles
│   ├── index-*.js     # Bundled JavaScript
│   └── ...            # Other assets
├── images/            # Static images
│   ├── titipmart_logo_*.png
│   ├── marketplace_hero_banner_*.png
│   ├── exclusive_glasses_promo_*.png
│   ├── default_store_banner_*.png
│   └── welcome_promo_card_*.png
└── server.cjs         # Bundled Node.js server
```

## 📈 Monitoring & Logs

```bash
# View PM2 logs
pm2 logs titipmart

# View real-time monitoring
pm2 monit

# Check PM2 status
pm2 status
```

## 🔍 Troubleshooting

### Images not loading
- Pastikan semua images ada di `dist/images/` folder
- Check nginx/server static configuration
- Verify image paths di React components (harus `/assets/images/` bukan `/src/assets/`)

### AI Features not working
- Verify API keys di `.env.production`
- Check server logs untuk error messages
- Ensure network connectivity ke AI provider APIs

### Port conflicts
- Change port di server.ts atau via PORT environment variable
- Update nginx upstream configuration jika port berubah

### Memory issues
- Monitor dengan: `pm2 logs`
- Consider menggunakan clustering untuk production: `pm2 start server.cjs -i max`

## 🔐 Security Checklist

- [ ] API keys di `.env.production` tidak di-commit ke git
- [ ] HTTPS/SSL enabled dengan valid certificate
- [ ] Nginx security headers configured
- [ ] Rate limiting enabled (consider adding express-rate-limit)
- [ ] CORS properly configured untuk domain
- [ ] Regular backups configured
- [ ] Monitoring dan alerting setup

## 📱 Testing di Production

```bash
# Test aplikasi
curl https://www.marketdigi.me/

# Test API endpoint
curl -X POST https://www.marketdigi.me/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Check image loading
curl -I https://www.marketdigi.me/assets/images/titipmart_logo_1779527060606.png
```

## 🔄 Deployment Updates

Untuk update application di production:

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build
set NODE_ENV=production && npm run build

# Restart PM2
pm2 restart titipmart

# Verify
pm2 status
pm2 logs titipmart
```

## Support & Documentation

- Main domain: https://www.marketdigi.me/
- API documentation tersedia di aplikasi
- Check logs: `pm2 logs`
- Restart: `pm2 restart titipmart`

---

**Last Updated**: May 23, 2026  
**Status**: Production Ready ✅
