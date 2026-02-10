# Robot UI Deployment Guide

This guide will help you upload your Robot Control UI to GitHub and make it accessible to users.

## Part 1: Upload to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
git init
```

### Step 2: Create a .gitignore file

Make sure you have a `.gitignore` file to exclude unnecessary files:

```
node_modules/
.git_old/
bags/
*.log
.DS_Store
```

### Step 3: Add and Commit Your Files

```bash
git add .
git commit -m "Initial commit: Robot Control Web UI"
```

### Step 4: Create a GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it (e.g., "robot-control-ui")
5. Don't initialize with README (you already have files)
6. Click "Create repository"

### Step 5: Connect Local Repository to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Note:** You may need to authenticate with GitHub. Use a Personal Access Token instead of password:
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with "repo" permissions
- Use this token as your password when pushing

---

## Part 2: Run Your Project on a Server

Your server is already configured to run on port **8000** (see line 12 in `server.js`).

### Option A: Run on Your Local Machine

1. **Install dependencies:**
   ```bash
   cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access locally:**
   - Open browser and go to: `http://localhost:8000`
   - Or from same network: `http://YOUR_LOCAL_IP:8000`

### Option B: Deploy to a Cloud Server (Recommended for sharing)

#### Using a VPS (DigitalOcean, AWS, Google Cloud, etc.)

1. **Set up a Linux server** (Ubuntu recommended)

2. **Install Node.js on the server:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Git:**
   ```bash
   sudo apt-get install git
   ```

4. **Clone your repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Install PM2 (to keep server running):**
   ```bash
   sudo npm install -g pm2
   ```

7. **Start the server with PM2:**
   ```bash
   pm2 start server.js --name robot-ui
   pm2 save
   pm2 startup
   ```

8. **Configure firewall to allow port 8000:**
   ```bash
   sudo ufw allow 8000
   sudo ufw enable
   ```

9. **Access your app:**
   - `http://YOUR_SERVER_IP:8000`

---

## Part 3: Make It Accessible with a Domain Name (Optional)

### Option 1: Use Server IP Directly
Users can access: `http://YOUR_SERVER_IP:8000`

### Option 2: Use a Domain Name

1. **Buy a domain** (from Namecheap, GoDaddy, Google Domains, etc.)

2. **Point domain to your server:**
   - Add an A record pointing to your server's IP address

3. **Set up Nginx as reverse proxy** (to use port 80 instead of 8000):

   ```bash
   sudo apt-get install nginx
   ```

4. **Create Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/robot-ui
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/robot-ui /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Now users can access:** `http://yourdomain.com` (without port number!)

### Option 3: Add HTTPS (SSL Certificate)

Use Let's Encrypt for free SSL:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Now users can access: `https://yourdomain.com` 🔒

---

## Part 4: Quick Deployment Options

### Option A: Heroku (Free tier available)

1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: node server.js
   ```
3. Deploy:
   ```bash
   heroku create
   git push heroku main
   ```

### Option B: Render.com (Free tier)

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy automatically

### Option C: Railway.app (Free tier)

1. Connect GitHub repository
2. Auto-detects Node.js
3. Deploys automatically

---

## Important Notes

### Port Configuration
Your server is currently set to port **8000** in `server.js` (line 12):
```javascript
const PORT = 8000;
```

To change the port, modify this line. For example:
```javascript
const PORT = process.env.PORT || 8000;
```

This allows cloud platforms to set their own port while defaulting to 8000 locally.

### Security Considerations

1. **Never commit sensitive data** (passwords, API keys)
2. **Use environment variables** for configuration
3. **Enable HTTPS** for production
4. **Set up proper authentication** if needed

### Sharing the URL

Once deployed, share the URL with users:
- **Local network:** `http://YOUR_LOCAL_IP:8000`
- **Public server:** `http://YOUR_SERVER_IP:8000`
- **With domain:** `http://yourdomain.com`
- **With SSL:** `https://yourdomain.com`

Users just need to open this URL in any browser (Chrome, Firefox, Safari, Edge, etc.)

---

## Troubleshooting

### Port already in use
```bash
# Find what's using port 8000
sudo lsof -i :8000
# Kill the process
sudo kill -9 PID
```

### Server not accessible from outside
- Check firewall settings
- Ensure server is listening on `0.0.0.0` (not `localhost`)
- Your server.js already has this correct: `server.listen(PORT, '0.0.0.0')`

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Start Commands

```bash
# 1. Upload to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 2. Run locally
npm install
npm start

# 3. Access
# Open browser: http://localhost:8000
```

---

## Need Help?

- GitHub Documentation: https://docs.github.com
- Node.js Documentation: https://nodejs.org/docs
- PM2 Documentation: https://pm2.keymetrics.io
- Nginx Documentation: https://nginx.org/en/docs
