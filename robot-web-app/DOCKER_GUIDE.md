# 🐳 Docker Setup Guide - Robot Control Web UI

यह guide आपको बताएगा कि कैसे Docker image बनाएं, TAR file में save करें, और deploy करें।

---

## 📋 Prerequisites

सबसे पहले Docker install करें:

```bash
# Docker install करें (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install docker.io docker-compose -y

# Docker service start करें
sudo systemctl start docker
sudo systemctl enable docker

# अपने user को docker group में add करें
sudo usermod -aG docker $USER

# Logout और login करें या run करें:
newgrp docker
```

---

## 🚀 Quick Start (आसान तरीका)

### **Option 1: Interactive Script का उपयोग करें**

```bash
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
./docker-manager.sh
```

यह एक interactive menu दिखाएगा जहाँ आप select कर सकते हैं:
1. Build Docker image
2. Save to TAR file
3. Load from TAR file
4. Run container
5. और भी बहुत कुछ!

---

## 📦 Manual Commands (Step by Step)

### **Step 1: Docker Image Build करें**

```bash
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app

# docker-compose से build करें
docker-compose build

# या सीधे docker से
docker build -t robot-control-web:latest .
```

### **Step 2: Docker Image को TAR File में Save करें**

```bash
# Image को tar file में save करें
docker save robot-control-web:latest -o robot-control-web.tar

# File size check करें
ls -lh robot-control-web.tar
```

### **Step 3: TAR File को Compress करें (Optional)**

```bash
# Tar file को compress करें (size कम करने के लिए)
gzip robot-control-web.tar

# अब आपके पास robot-control-web.tar.gz होगा
```

### **Step 4: Container Run करें**

```bash
# docker-compose से run करें
docker-compose up -d

# या सीधे docker से
docker run -d -p 8000:8000 --name robot-control-web robot-control-web:latest
```

### **Step 5: Container Status Check करें**

```bash
# Running containers देखें
docker ps

# Logs देखें
docker-compose logs -f

# या
docker logs -f robot-control-web
```

---

## 💾 TAR File को दूसरी Machine पर Transfer करें

### **Machine 1 (जहाँ image बनाई है):**

```bash
# Image save करें
docker save robot-control-web:latest -o robot-control-web.tar

# Compress करें
gzip robot-control-web.tar

# अब robot-control-web.tar.gz को copy करें
# USB, SCP, या किसी भी method से
```

### **Machine 2 (जहाँ deploy करना है):**

```bash
# Compressed file को decompress करें
gunzip robot-control-web.tar.gz

# Image load करें
docker load -i robot-control-web.tar

# Verify करें कि image load हो गई
docker images | grep robot-control-web

# Container run करें
docker run -d -p 8000:8000 --name robot-control-web robot-control-web:latest
```

---

## 🔧 Useful Docker Commands

### **Image Management:**

```bash
# सभी images देखें
docker images

# Image delete करें
docker rmi robot-control-web:latest

# Unused images clean करें
docker image prune -a
```

### **Container Management:**

```bash
# Running containers देखें
docker ps

# सभी containers देखें (stopped भी)
docker ps -a

# Container stop करें
docker stop robot-control-web

# Container start करें
docker start robot-control-web

# Container restart करें
docker restart robot-control-web

# Container delete करें
docker rm robot-control-web

# Container के अंदर जाएं
docker exec -it robot-control-web /bin/bash
```

### **Logs और Debugging:**

```bash
# Logs देखें (real-time)
docker logs -f robot-control-web

# Last 100 lines देखें
docker logs --tail 100 robot-control-web

# Container stats देखें
docker stats robot-control-web

# Container inspect करें
docker inspect robot-control-web
```

---

## 🌐 Docker Compose Commands

```bash
# Build और run करें
docker-compose up -d

# Rebuild करें
docker-compose up -d --build

# Stop करें
docker-compose down

# Logs देखें
docker-compose logs -f

# Specific service के logs
docker-compose logs -f robot-control-web

# Container restart करें
docker-compose restart

# Container status देखें
docker-compose ps
```

---

## 📤 TAR File को Share करने के तरीके

### **1. USB Drive:**
```bash
cp robot-control-web.tar.gz /media/usb/
```

### **2. SCP (Network के through):**
```bash
scp robot-control-web.tar.gz user@remote-server:/path/to/destination/
```

### **3. Cloud Storage:**
```bash
# Google Drive, Dropbox, etc. पर upload करें
```

### **4. Docker Registry (Advanced):**
```bash
# Docker Hub पर push करें
docker tag robot-control-web:latest yourusername/robot-control-web:latest
docker push yourusername/robot-control-web:latest

# दूसरी machine पर pull करें
docker pull yourusername/robot-control-web:latest
```

---

## 🎯 Complete Workflow Example

### **Development Machine:**

```bash
# 1. Image build करें
docker-compose build

# 2. Test करें locally
docker-compose up -d
# Browser में http://localhost:8000 खोलें

# 3. Image save करें
docker save robot-control-web:latest -o robot-control-web.tar

# 4. Compress करें
gzip robot-control-web.tar

# 5. Transfer करें
scp robot-control-web.tar.gz user@production-server:/tmp/
```

### **Production Machine:**

```bash
# 1. File decompress करें
cd /tmp
gunzip robot-control-web.tar.gz

# 2. Image load करें
docker load -i robot-control-web.tar

# 3. docker-compose.yml copy करें (या manually बनाएं)

# 4. Run करें
docker-compose up -d

# 5. Verify करें
docker ps
curl http://localhost:8000
```

---

## 📊 File Sizes (Approximate)

| File | Size |
|------|------|
| Docker Image | ~400-500 MB |
| TAR file | ~400-500 MB |
| Compressed TAR (.tar.gz) | ~150-200 MB |

---

## 🔒 Security Best Practices

1. **Credentials change करें:**
   - Production में default username/password न use करें
   
2. **Environment variables use करें:**
   ```bash
   # .env file बनाएं
   echo "USERNAME=your_user" > .env
   echo "PASSWORD=your_pass" >> .env
   ```

3. **HTTPS enable करें:**
   - Nginx reverse proxy use करें
   - SSL certificate add करें

---

## ❓ Troubleshooting

### **Problem: "Permission denied"**
```bash
# Solution:
sudo usermod -aG docker $USER
newgrp docker
```

### **Problem: "Port 8000 already in use"**
```bash
# Solution: Port change करें docker-compose.yml में
ports:
  - "8001:8000"  # Host port 8001 use करें
```

### **Problem: "Cannot connect to Docker daemon"**
```bash
# Solution:
sudo systemctl start docker
```

### **Problem: "Image not found after loading"**
```bash
# Solution: Image name verify करें
docker images
docker load -i robot-control-web.tar
```

---

## 🎉 Summary

आपके पास अब है:

✅ **Dockerfile** - Image build करने के लिए  
✅ **docker-compose.yml** - Container orchestration के लिए  
✅ **docker-manager.sh** - Interactive management script  
✅ **.dockerignore** - Unnecessary files exclude करने के लिए  

### **Quick Commands:**

```bash
# सब कुछ एक साथ (Build + Save + Run)
./docker-manager.sh
# फिर option 8 select करें

# या manually:
docker-compose build                                    # Build
docker save robot-control-web:latest -o robot-control-web.tar  # Save
docker-compose up -d                                    # Run
```

---

**अब आप अपनी Robot Control Web UI को Docker में run कर सकते हैं! 🚀**
