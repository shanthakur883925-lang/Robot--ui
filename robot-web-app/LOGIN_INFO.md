# 🔐 Robot Control UI - Login Credentials

## 📝 **Login Information**

### **Username:** `validation`
### **Password:** `validation123`

---

## 🌐 **Access URLs**

### **Local Network:**
- **Your Network IP:** `http://10.30.72.238:8000`
- **Localhost (same computer):** `http://localhost:8000`

### **Public Internet:**
- Run `./create-public-link.sh` to generate a public URL
- Example: `https://abc123.ngrok.io`

### **GitHub Repository:**
- **Code:** https://github.com/shanthakur883925-lang/Robot--ui

---

## 🚀 **Quick Start Guide**

### **Step 1: Access the UI**
Open your browser and go to one of these URLs:
- `http://localhost:8000` (on your computer)
- `http://10.30.72.238:8000` (from any device on your network)

### **Step 2: Login**
Enter the credentials:
- **Username:** `validation`
- **Password:** `validation123`

### **Step 3: Use the Robot Control**
After login, you'll see the robot control dashboard where you can:
- Select robot type (ZippyX, Zippy40, Forklift)
- Enter robot number
- Run validation commands
- Control robot via Teleop
- Access Maintenance mode
- View terminal output

---

## 🤖 **Robot Configuration**

### **Default Robot Settings:**
- **Robot Username:** `zippy`
- **Robot Password:** `zippy`
- **IP Prefix:** `10.30.72.`
- **IP Offset:** `60`

### **Robot IP Calculation:**
```
Robot IP = 10.30.72.(robot_number + 60)

Examples:
- Robot 1  → 10.30.72.61
- Robot 10 → 10.30.72.70
- Robot 40 → 10.30.72.100
```

---

## 📋 **Complete Access Information**

| Item | Value |
|------|-------|
| **Web UI Username** | `validation` |
| **Web UI Password** | `validation123` |
| **Server Port** | `8000` |
| **Local IP** | `10.30.72.238:8000` |
| **Robot Username** | `zippy` |
| **Robot Password** | `zippy` |

---

## 🔧 **Server Management**

### **Start Server:**
```bash
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
./start-server.sh
```

### **Create Public Link:**
```bash
./create-public-link.sh
```

### **Check if Server is Running:**
```bash
lsof -i:8000
```

### **Stop Server:**
```bash
# Find the process
lsof -i:8000

# Kill it
kill -9 <PID>
```

---

## 📱 **Share with Others**

### **For Users on Same Network:**
Send them:
```
URL: http://10.30.72.238:8000
Username: validation
Password: validation123
```

### **For Users on Internet:**
1. Run `./create-public-link.sh`
2. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Send them:
```
URL: https://abc123.ngrok.io
Username: validation
Password: validation123
```

---

## 🎯 **Important Notes**

1. **Login Page:** The UI automatically redirects to the login page when you first access it
2. **Session:** After successful login, you'll be redirected to the main robot control dashboard
3. **Security:** These are default credentials - consider changing them for production use
4. **Multiple Users:** Multiple users can log in simultaneously
5. **Robot Access:** Make sure robots are on the same network and accessible

---

## 🔒 **To Change Login Credentials**

Edit the file: `/home/vlabuser2/.gemini/antigravity/scratch/robot-web-app/public/login.html`

Find line 338 and change:
```javascript
if (user === "validation" && pass === "validation123") {
```

To your desired credentials:
```javascript
if (user === "YOUR_USERNAME" && pass === "YOUR_PASSWORD") {
```

---

## ✅ **Quick Test**

1. Open browser: `http://localhost:8000`
2. Enter username: `validation`
3. Enter password: `validation123`
4. Click LOGIN
5. You should see the Robot Control Dashboard! 🎉

---

**Need help? Check the other guides:**
- `ACCESS_GUIDE.md` - How to access the UI
- `HOW_TO_DEPLOY.md` - How to deploy to cloud
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `README.md` - Project overview
