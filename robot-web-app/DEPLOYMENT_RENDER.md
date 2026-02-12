# 🚀 RENDER.COM DEPLOYMENT GUIDE

## Quick Deploy (5-10 Minutes)

### Step 1: Create Render Account
1. Go to: https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access GitHub

### Step 2: Create New Web Service
1. Click "New +" button (top right)
2. Select "Web Service"
3. Connect your repository: `Robot--ui`
4. Click "Connect"

### Step 3: Configure Service
```
Name:           robot-control-web
Environment:    Node
Region:         Singapore (or closest to you)
Branch:         main

Build Command:  npm install
Start Command:  npm start

Instance Type:  Free
```

### Step 4: Environment Variables
Add these:
```
PORT = 8001
NODE_ENV = production
```

### Step 5: Deploy!
Click "Create Web Service"

Wait 5-10 minutes for deployment to complete.

### Step 6: Access Your App
Your app will be live at:
```
https://robot-control-web.onrender.com
```

OR custom domain:
```
https://your-custom-name.onrender.com
```

---

## 🔗 Share This URL
```
Login credentials:
Username: validation
Password: validation123

App URL: https://robot-control-web.onrender.com
```

---

## ⚙️ Important Notes

### Free Tier Limitations:
- ✅ 750 hours/month free
- ✅ Automatic HTTPS
- ⚠️ Spins down after 15 min inactivity
- ⚠️ First load after idle = slower (30 sec)

### Solution for Spin-Down:
Use a uptime monitor (free):
- UptimeRobot.com
- Pings your app every 5 minutes
- Keeps it always warm

---

## 🐛 Troubleshooting

### Build Failed?
Check:
1. package.json exists ✅
2. npm install runs locally ✅
3. Node version compatible ✅

### App Not Loading?
Check:
1. PORT environment variable = 8001
2. server.js listening on 0.0.0.0
3. Render logs for errors

### SSH to Robots Not Working?
⚠️ Render free tier doesn't support outbound SSH
Solution: Deploy on VPS or use Railway

---

## 🔄 Auto-Deploy on Git Push

Render automatically deploys when you:
```bash
git push origin main
```

No manual deployment needed! 🎉

---

## 📊 Monitor Deployment

View logs in real-time:
1. Go to your service dashboard
2. Click "Logs" tab
3. See live deployment status

---

## 💰 Cost

FREE Plan:
- ✅ Unlimited deploys
- ✅ Automatic HTTPS
- ✅ 750 hours/month
- ✅ No credit card

Paid Plan ($7/month):
- ✅ Always running (no spin-down)
- ✅ More resources
- ✅ Priority support
