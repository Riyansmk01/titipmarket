# ✅ TitipMart Production Checklist

## Pre-Deployment Verification

### Code & Build
- [x] Image paths fixed dari `/src/assets/images/` ke `/assets/images/`
- [x] Vite config updated untuk production optimization
- [x] Build successful: `npm run build`
- [x] All 5 images copied to dist folder
- [x] dist/server.cjs generated correctly
- [x] dist/index.html accessible
- [x] .env.production configured dengan semua API keys

### Images Verification
```
dist/images/
├── [x] default_store_banner_1779528712410.png
├── [x] exclusive_glasses_promo_1779528963521.png
├── [x] marketplace_hero_banner_1779528695181.png
├── [x] titipmart_logo_1779527060606.png
└── [x] welcome_promo_card_1779529424669.png
```

### API Keys Configuration
```
.env.production:
├── [x] PAKASIR_API_KEY
├── [x] MISTRAL_API_KEY
├── [x] NVIDIA_API_KEY
├── [x] GROQ_API_KEY
├── [x] GEMINI_API_KEY
└── [x] OPENAI_API_KEY
```

### Multi-AI Fallback Chain
- [x] Gemini (primary)
- [x] OpenAI (fallback 1)
- [x] Groq (fallback 2)
- [x] Nvidia (fallback 3)
- [x] Mistral (fallback 4)

### Server Configuration
- [x] server.ts configured untuk production mode
- [x] Static file serving dari dist folder
- [x] SPA fallback configured
- [x] PORT: 3000 (customizable)

### Dependencies
- [x] All npm packages installed
- [x] terser package installed
- [x] Production build working

## Production Server Setup

### On Production Machine (marketdigi.me)

#### Step 1: Prerequisites
- [ ] Node.js v18+ installed
- [ ] npm atau yarn installed
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Nginx installed (untuk reverse proxy)
- [ ] SSL certificate obtained

#### Step 2: Clone/Deploy Code
```bash
# Option A: Git clone
git clone <repo-url> /app/titipmart

# Option B: Direct copy via scp
scp -r . user@marketdigi.me:/app/titipmart/
```

#### Step 3: Install & Build
```bash
cd /app/titipmart
npm ci --production
NODE_ENV=production npm run build
```

#### Step 4: Start with PM2
```bash
pm2 start dist/server.cjs --name "titipmart"
pm2 save
pm2 startup
```

#### Step 5: Configure Nginx
```nginx
upstream titipmart_backend {
    server 127.0.0.1:3000;
}

server {
    listen 443 ssl http2;
    server_name www.marketdigi.me marketdigi.me;
    
    ssl_certificate /etc/letsencrypt/live/marketdigi.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marketdigi.me/privkey.pem;
    
    location / {
        proxy_pass http://titipmart_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Step 6: Verify Deployment
- [ ] Access https://www.marketdigi.me/ in browser
- [ ] All images loading correctly
- [ ] AI features responsive
- [ ] API endpoints working
- [ ] No console errors

## Maintenance & Monitoring

### Daily Tasks
- [ ] Monitor PM2: `pm2 status`
- [ ] Check logs: `pm2 logs titipmart`
- [ ] Monitor server resources: `pm2 monit`

### Weekly Tasks
- [ ] Review error logs
- [ ] Check API key usage limits
- [ ] Verify all images displaying correctly
- [ ] Test multi-AI fallback chain

### Monthly Tasks
- [ ] SSL certificate renewal check
- [ ] Update dependencies: `npm audit`
- [ ] Performance optimization review
- [ ] Backup database/important files

## Troubleshooting Guide

### Issue: Images Not Loading
**Solution:**
```bash
# Check dist/images folder exists
ls -la dist/images/

# Verify Nginx serving static files
curl https://www.marketdigi.me/assets/images/titipmart_logo_1779527060606.png

# Check server logs
pm2 logs titipmart
```

### Issue: AI Features Not Working
**Solution:**
```bash
# Check API keys in .env.production
cat .env.production

# Check server logs for API errors
pm2 logs titipmart

# Verify network connectivity (from server)
ping api.openai.com
```

### Issue: 404 on Images
**Solution:**
- Ensure `/assets/images/` paths used (not `/src/assets/`)
- Check Nginx config für staticFilesLocation
- Verify all images copied to dist/images/

### Issue: Application Crashes
**Solution:**
```bash
# Restart application
pm2 restart titipmart

# Check for memory leaks
pm2 monit

# View full logs
pm2 logs titipmart --lines 100
```

## Rollback Plan

If deployment has issues:

```bash
# Stop current version
pm2 stop titipmart

# Restore previous version (if using git)
git checkout previous-tag
npm run build

# Restart
pm2 start dist/server.cjs --name "titipmart"
```

## Performance Optimization

### Already Configured:
- [x] CSS minification (Vite)
- [x] JavaScript minification (terser)
- [x] Asset fingerprinting (cache busting)
- [x] Gzip compression (configure in Nginx)

### Recommended Additional Setup:
- [ ] CDN for static assets
- [ ] Redis cache for API responses
- [ ] Database query optimization
- [ ] Image compression/WebP conversion

## Security Checklist

- [x] .env.production tidak di-commit ke git
- [ ] HTTPS/SSL configured dan enabled
- [ ] Nginx security headers configured
- [ ] Rate limiting enabled (optional)
- [ ] CORS configuration updated untuk domain
- [ ] Regular backups setup
- [ ] Monitoring & alerting configured
- [ ] API key rotation policy established

## Testing Production Build Locally

Before deploying to server:

```bash
# Build
NODE_ENV=production npm run build

# Run locally
NODE_ENV=production npm start

# Visit http://localhost:3000
# Check Network tab untuk verify images loading from /assets/images/
# Test AI features
```

## Useful Commands Reference

```bash
# PM2
pm2 start dist/server.cjs --name "titipmart"
pm2 stop titipmart
pm2 restart titipmart
pm2 delete titipmart
pm2 logs titipmart
pm2 monit
pm2 status
pm2 save

# Deployment
npm ci --production
NODE_ENV=production npm run build
npm run build

# Logs
tail -f ~/.pm2/logs/titipmart-error.log
tail -f ~/.pm2/logs/titipmart-out.log

# Server status
curl https://www.marketdigi.me/
curl -I https://www.marketdigi.me/assets/images/titipmart_logo_1779527060606.png
```

## Support Contacts

- **Deployment Script**: `deploy-production.sh` (Linux) atau `deploy-production.bat` (Windows)
- **Documentation**: `DEPLOYMENT.md`
- **Build Log**: Check output dari `npm run build`
- **PM2 Logs**: `pm2 logs titipmart`

---

**Status**: ✅ Production Ready  
**Last Verified**: May 23, 2026  
**Deployment Version**: 1.0.0
