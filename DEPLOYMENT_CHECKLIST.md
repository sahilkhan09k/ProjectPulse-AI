# Deployment Checklist - ProjectPulse AI

## Issues Fixed ✅

### 1. **404 on Page Refresh (Vercel SPA Routing)**
- ✅ Created `Frontend/vercel.json` with rewrite rules
- ✅ All routes now redirect to `index.html` for client-side routing

### 2. **401 Unauthorized & Cookie Issues (Cross-Origin)**
- ✅ Updated backend CORS to support multiple origins
- ✅ Changed cookie `sameSite` from `strict` to `none` in production
- ✅ Added `path: '/'` to cookie options
- ✅ Configured proper CORS headers for credentials

---

## Deployment Steps

### Backend (Render) - Already Deployed ✅
Your backend is at: `https://projectpulse-ai.onrender.com`

**Now you need to:**

1. **Update Environment Variable on Render:**
   - Go to Render Dashboard → Your Service
   - Click **Environment** tab
   - Update `FRONTEND_URL` to your Vercel URL:
     ```
     FRONTEND_URL=https://your-app-name.vercel.app
     ```
   - Save (will auto-redeploy)

2. **Verify Backend is Running:**
   - Visit: `https://projectpulse-ai.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Seed Database (if not done):**
   - Go to Render Dashboard → Shell tab
   - Run: `cd Backend && npm run seed`

---

### Frontend (Vercel) - Needs Redeployment

1. **Add `vercel.json` to Git** (Already done ✅)

2. **Set Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project
   - Click **Settings** → **Environment Variables**
   - Add these variables:

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_API_URL` | `https://projectpulse-ai.onrender.com/api` |
   | `VITE_SOCKET_URL` | `https://projectpulse-ai.onrender.com` |

   - Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Redeploy Frontend:**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - OR push the latest changes to trigger auto-deploy

---

## Verification Steps

### 1. Test Backend Health
```bash
curl https://projectpulse-ai.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Test Frontend Routing
- Visit your Vercel URL
- Navigate to `/dashboard` (will redirect to login)
- **Refresh the page** - should NOT show 404

### 3. Test Authentication
1. Go to login page
2. Click "Use demo credentials" button
3. Click "Sign in"
4. Should redirect to dashboard
5. **Refresh the dashboard page** - should stay logged in
6. Check browser console - no 401 errors

### 4. Test Real-Time Features
1. Open dashboard in two browser tabs
2. Changes in one should appear in the other
3. Check browser console for Socket.io connection

---

## Troubleshooting

### Issue: Still getting 401 errors

**Check:**
1. ✅ `FRONTEND_URL` is set correctly on Render
2. ✅ Backend has redeployed after env var change
3. ✅ Frontend has redeployed with new `vercel.json`
4. ✅ Environment variables are set in Vercel
5. ✅ Browser cookies are enabled

**Test CORS:**
```bash
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://projectpulse-ai.onrender.com/api/auth/login -v
```

Should see: `Access-Control-Allow-Origin: https://your-app.vercel.app`

### Issue: 404 on refresh

**Check:**
1. ✅ `vercel.json` exists in `Frontend/` directory
2. ✅ Frontend has been redeployed after adding `vercel.json`
3. ✅ File is committed to git

### Issue: Cookies not being set

**Check:**
1. ✅ Both frontend and backend use HTTPS in production
2. ✅ `sameSite: 'none'` is set in production
3. ✅ `secure: true` is set in production
4. ✅ `withCredentials: true` in axios config

### Issue: CORS errors

**Check:**
1. ✅ `FRONTEND_URL` matches your Vercel URL exactly (no trailing slash)
2. ✅ Backend CORS allows credentials
3. ✅ Frontend sends `withCredentials: true`

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
GROQ_API_KEY=<optional>
```

### Frontend (Vercel)
```env
VITE_API_URL=https://projectpulse-ai.onrender.com/api
VITE_SOCKET_URL=https://projectpulse-ai.onrender.com
```

---

## Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Login works with demo credentials
- [ ] Dashboard displays data
- [ ] Page refresh doesn't show 404
- [ ] User stays logged in after refresh
- [ ] Real-time updates work
- [ ] Simulation modal works
- [ ] No CORS errors in console
- [ ] No 401 errors in console

---

## Demo Credentials

```
Email: alice@projectpulse.demo
Password: Demo123!
```

Other users: bob, carol, david, eve, frank (all @projectpulse.demo, same password)

---

## Support

If issues persist:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for client errors
4. Verify all environment variables are set correctly
5. Ensure both services have redeployed after changes

---

**Last Updated:** After fixing CORS and SPA routing issues
**Status:** Ready for deployment ✅
