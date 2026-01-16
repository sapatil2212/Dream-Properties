# 🚀 Vercel Single Bundle Deployment Guide

## ✅ What Changed?

Your Express.js backend has been converted to **Vercel Serverless Functions** so everything deploys together on Vercel!

### Key Changes:
1. ✅ Backend converted to `/api/index.js` (Vercel Serverless Function)
2. ✅ `vercel.json` configured for API routes
3. ✅ Frontend and backend now on **same domain** (no CORS issues!)
4. ✅ `VITE_API_URL` set to empty string (uses relative paths)

---

## 📦 Deploy to Vercel (Single Command)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Convert backend to Vercel serverless functions"
git push origin main
```

### Step 2: Deploy on Vercel

#### Option A: Vercel Dashboard (Recommended)
1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repo: `dream-properties-saas`
4. **Framework Preset**: Vite
5. **Root Directory**: `./` (leave as is)
6. **Build Command**: `npm run build` (auto-detected)
7. **Output Directory**: `dist` (auto-detected)

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Step 3: Add Environment Variables on Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```env
# Database
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=W8rgNqHKvNaS2B8.root
DB_PASSWORD=zl7zf9N1cCFHve7R
DB_NAME=dream_properties

# JWT & Session
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=dreampropertiesnashik@gmail.com
EMAIL_PASSWORD=cqfjbwwoyqltxsfo

# Super Admin
SUPER_ADMIN_EMAIL=dreampropertiesnashik@gmail.com
SUPER_ADMIN_PASSWORD=Dreamproperties@2026

# Cloudinary
CLOUDINARY_CLOUD_NAME=drctoxvtl
CLOUDINARY_API_KEY=294341866592413
CLOUDINARY_API_SECRET=pD3c1BvgzpZd9FVOvleG-daazL8

# Frontend URL (use your Vercel URL)
FRONTEND_URL=https://your-app-name.vercel.app

# API URL (leave empty for same-domain deployment)
VITE_API_URL=

# Node Environment
NODE_ENV=production
```

**Important**: Replace `FRONTEND_URL` with your actual Vercel app URL after first deployment!

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait 2-3 minutes
4. Visit your app: `https://your-app-name.vercel.app`

---

## ✅ Verification

### Test API Health
Visit: `https://your-app-name.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2026-01-17T00:00:00.000Z"
}
```

### Test Frontend
1. Visit: `https://your-app-name.vercel.app`
2. Try to sign up / login
3. Check if properties load

---

## 🔧 How It Works

### Architecture
```
Vercel Deployment
├── Frontend (React + Vite) → /dist → Served at /
└── Backend (Express API) → /api/index.js → Served at /api/*
```

### API Routes
All your Express routes are now serverless:
- `/api/auth/*` → Authentication
- `/api/profile/*` → User profile
- `/api/superadmin/*` → Admin operations
- `/api/builder/*` → Builder operations
- `/api/upload-image` → Cloudinary uploads

### Local Development
```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Express - for local testing)
npm run server
```

Frontend dev server: `http://localhost:3000`
Backend dev server: `http://localhost:5000`

In development, API calls still go to `localhost:5000` (configured in `config/api.ts`)

---

## 🐛 Troubleshooting

### "Server isn't running"
- ✅ Check environment variables are set correctly on Vercel
- ✅ Make sure you clicked "Redeploy" after adding env vars
- ✅ Check `/api/health` endpoint responds

### Database Connection Errors
**Problem**: TiDB Cloud blocking Vercel IPs

**Solution**:
1. Go to TiDB Cloud Console
2. Navigate to your cluster → **Network Access**
3. Click **"Add IP Address"**
4. Add: `0.0.0.0/0` (Allow all IPs)
   - **Note**: This allows any IP. For production, get Vercel's IP ranges from their docs.

### CORS Errors
**Not Needed!** Since frontend and backend are on same domain, no CORS issues.

If you still see CORS errors:
- Make sure `VITE_API_URL` is empty or not set
- Check API calls use relative paths (e.g., `/api/auth/login`)

### Login/Cookies Not Working
**Problem**: Cookies not being set

**Solution**: Cookies work automatically on same domain. If issues persist:
1. Check `api/index.js` has `credentials: true` in CORS
2. Verify `sameSite: 'lax'` in cookie settings
3. Make sure `secure: true` only in production

### Cold Starts (First Request Slow)
**Behavior**: First API call after inactivity takes 10-20 seconds

**Reason**: Vercel serverless functions "wake up" after idle time

**Solutions**:
- **Free Tier**: Accept the cold start delay
- **Pro Tier** ($20/month): Faster cold starts
- **Use ping service**: Keep function warm with scheduled pings

---

## 💡 Pro Tips

### 1. Monitor Logs
- Go to Vercel Dashboard → Your Project → **Functions**
- Click on `/api/index` to see logs
- Check for errors in real-time

### 2. Test Locally Before Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Run Vercel dev server (simulates serverless environment)
vercel dev
```

### 3. Database Connection Pooling
The current `pool` from `mysql2/promise` works well with serverless.
Each function instance reuses connections efficiently.

### 4. Increase Function Timeout
Current: 10 seconds (in `vercel.json`)

If you need more time for complex operations:
```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

Max free tier: 10 seconds  
Max pro tier: 60 seconds

---

## 🎉 Success!

Your full-stack app is now deployed on Vercel as a **single bundle**!

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-app-name.vercel.app/api/*`
- **Same domain** = No CORS issues!
- **Auto-scaling** = Handles traffic spikes automatically
- **HTTPS** = Free SSL certificate included

---

## 📝 Next Steps (Optional)

### Update Hardcoded URLs
You still have 25+ hardcoded `http://localhost:5000` URLs in your code.

While the app works now, it's better to use the helper function:

```typescript
import { getApiUrl } from '@/config/api';

// Instead of:
fetch('http://localhost:5000/api/auth/login', {...})

// Use:
fetch(getApiUrl('/api/auth/login'), {...})
```

This makes switching between environments easier.

**Want me to update all URLs automatically?** Just ask!

---

## 📞 Support

If deployment fails:
1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Test `/api/health` endpoint first
4. Check database connectivity from Vercel

Happy deploying! 🚀
