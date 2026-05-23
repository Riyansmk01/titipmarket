# Production Environment Variables Setup

## 🚨 CRITICAL ISSUE RESOLVED

Your production server was returning 500 errors because **API keys were not being loaded from environment variables**. The `.env.production` file is in `.gitignore`, so it never reaches your production server.

**Solution**: Set environment variables directly on your production server using one of the methods below.

---

## Quick Status Check

Run this on your production server to verify which API keys are loaded:

```bash
# This will show which API keys are available
curl https://www.marketdigi.me/api/health 2>/dev/null || echo "Server not responding"
```

After redeploying with fixes, check server logs:

```bash
# If using PM2
pm2 logs titipmart

# If using systemd
journalctl -u titipmart -f

# Docker
docker logs titipmart -f
```

---

## Method 1: Linux Server with Systemd (RECOMMENDED)

### Step 1: Create environment file

```bash
sudo nano /etc/titipmart/.env.production
```

Paste this content (update with your actual API keys from `.env.production`):

```bash
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
MISTRAL_API_KEY=your_mistral_api_key_here
NVIDIA_API_KEY=your_nvidia_api_key_here
GROQ_API_KEY=your_groq_api_key_here
PAKASIR_API_KEY=your_pakasir_api_key_here
```

### Step 2: Set permissions

```bash
sudo chmod 600 /etc/titipmart/.env.production
sudo chown titipmart:titipmart /etc/titipmart/.env.production
```

### Step 3: Update systemd service

```bash
sudo nano /etc/systemd/system/titipmart.service
```

Add `EnvironmentFile`:

```ini
[Service]
User=titipmart
WorkingDirectory=/opt/titipmart
EnvironmentFile=/etc/titipmart/.env.production
ExecStart=/usr/bin/node /opt/titipmart/server.js
Restart=always
RestartSec=10
```

### Step 4: Reload and restart

```bash
sudo systemctl daemon-reload
sudo systemctl restart titipmart
sudo systemctl status titipmart
```

---

## Method 2: PM2 (If Using PM2)

### Step 1: Create ecosystem config

```bash
cd /opt/titipmart
nano ecosystem.config.js
```

Paste this:

```javascript
module.exports = {
  apps: [{
    name: "titipmart",
    script: "./server.js",
    instances: 1,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      GEMINI_API_KEY: "your_gemini_api_key_here",
      OPENAI_API_KEY: "your_openai_api_key_here",
      MISTRAL_API_KEY: "your_mistral_api_key_here",
      NVIDIA_API_KEY: "your_nvidia_api_key_here",
      GROQ_API_KEY: "your_groq_api_key_here",
      PAKASIR_API_KEY: "your_pakasir_api_key_here"
    }
  }]
};
```

### Step 2: Restart PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Method 3: Docker (If Using Docker)

### Step 1: Create .env file in container build

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV GEMINI_API_KEY=AIzaSyCUr9VRncAC4Jzqc-kujpvrr5sL2k_X57M
# ... other env vars ...

CMD ["node", "server.js"]
```

### Step 2: Or use environment variables when running

```bash
docker run -d \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY="your_gemini_api_key_here" \
  -e OPENAI_API_KEY="your_openai_api_key_here" \
  -e MISTRAL_API_KEY="your_mistral_api_key_here" \
  -e NVIDIA_API_KEY="your_nvidia_api_key_here" \
  -e GROQ_API_KEY="your_groq_api_key_here" \
  -e PAKASIR_API_KEY="your_pakasir_api_key_here" \
  -p 3000:3000 \
  titipmart:latest
```

---

## Method 4: Hosting Control Panel (Cpanel, Plesk, etc.)

1. Log in to your hosting control panel
2. Find "Environment Variables" or "Configuration"
3. Add each key individually:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `GEMINI_API_KEY` = `AIzaSyCUr9VRncAC4Jzqc-kujpvrr5sL2k_X57M`
   - `OPENAI_API_KEY` = `sk-proj-...`
   - etc.

---

## Method 5: Vercel (If Deployed to Vercel)

1. Go to https://vercel.com/dashboard
2. Select your TitipMart project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `GEMINI_API_KEY` | **Value**: `AIzaSyCUr9VRncAC4Jzqc-kujpvrr5sL2k_X57M` | **Environments**: Production
   - **Name**: `OPENAI_API_KEY` | **Value**: `sk-proj-...` | **Environments**: Production
   - etc.
5. Redeploy: `vercel --prod`

---

## Verification Steps

### 1. Check logs after restart

```bash
# Should show: ✓ Loaded for each API key
tail -n 50 /var/log/titipmart/server.log
```

### 2. Test API endpoint

```bash
curl https://www.marketdigi.me/api/auth/google-login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test"}'

# Should return valid JSON (not HTML error)
```

### 3. Test notifications endpoint

```bash
curl https://www.marketdigi.me/api/notifications

# Should return JSON array (not HTML 500 error)
```

### 4. Check process status

```bash
# If using PM2
pm2 status

# If using systemd
systemctl status titipmart

# Check open ports
netstat -tlnp | grep 3000
```

---

## Troubleshooting

### Still getting 500 errors?

1. **Check if server is running**:
   ```bash
   ps aux | grep node
   ```

2. **Check server logs**:
   ```bash
   tail -n 100 /var/log/titipmart/server.log | grep "ENV STATUS"
   ```

3. **Verify PORT is accessible**:
   ```bash
   netstat -tlnp | grep 3000
   curl http://localhost:3000/api/notifications
   ```

4. **Check Nginx/reverse proxy config**:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Verify file permissions**:
   ```bash
   ls -la /opt/titipmart/
   ```

### API keys still showing MISSING?

Make sure you're using the right method for your hosting:
- **Systemd**: Check `/etc/systemd/system/titipmart.service` has `EnvironmentFile` line
- **PM2**: Check `ecosystem.config.js` has env section
- **Docker**: Check `docker run` command has `-e` flags
- **Vercel**: Check Environment Variables in dashboard and redeploy

---

## Security Best Practices

⚠️ **NEVER**:
- Commit `.env.production` to git
- Share API keys in chat, email, or documentation
- Log API keys to console in production

✅ **DO**:
- Use hosting platform's built-in environment variable management
- Rotate API keys periodically
- Use read-only access for monitoring/logging
- Implement API key versioning

---

## Next Steps

1. **Deploy the fixed server code** (includes error handling improvements)
2. **Set environment variables** using one of the methods above
3. **Restart your server**
4. **Test the API endpoints** using verification steps
5. **Monitor logs** for any remaining issues

After these changes, you should see:
- ✅ `/api/auth/google-login` returning valid JSON
- ✅ `/api/notifications` returning 200 with data
- ✅ `/api/orders` returning 200 with data
- ✅ `/api/chats` returning 200 with data

---

## Questions?

If issues persist:
1. Check `[ENV STATUS]` log output
2. Verify process is running and listening on correct port
3. Check Nginx logs: `tail -n 100 /var/log/nginx/error.log`
4. Test locally: `NODE_ENV=production npm run build && node server.js`
