# 🐳 Docker Image को Tar File में Save करने का Complete Guide

यह guide आपको step-by-step बताएगी कि कैसे Docker image build करें और tar file में save करें।

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Available Scripts](#available-scripts)
3. [Step-by-Step Instructions](#step-by-step-instructions)
4. [Commands Reference](#commands-reference)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### सबसे आसान तरीका (Recommended):

```bash
# Interactive menu खोलें
./docker-menu.sh
```

या

```bash
# एक command में सब कुछ करें (Build + Save)
./docker-save-load.sh all
```

---

## 📜 Available Scripts

आपके पास 3 helpful scripts हैं:

### 1. `docker-save-load.sh` - Main Script
Complete Docker image management के लिए

```bash
./docker-save-load.sh [option]
```

**Options:**
- `build` - Image build करें
- `save` - Normal tar file में save करें
- `save-compressed` - Compressed tar.gz में save करें (Recommended)
- `load` - Tar file से load करें
- `load-compressed` - Compressed tar.gz से load करें
- `all` - Build + Save + Info (Default)
- `info` - Image information देखें
- `clean` - Tar files delete करें
- `help` - Help message देखें

### 2. `docker-menu.sh` - Interactive Menu
आसान interactive menu के साथ

```bash
./docker-menu.sh
```

### 3. `docker-compose.yml` - Docker Compose Configuration
Standard docker-compose commands के लिए

```bash
docker-compose build
docker-compose up -d
docker-compose down
```

---

## 📝 Step-by-Step Instructions

### Method 1: Interactive Menu का उपयोग करें (सबसे आसान)

```bash
# 1. Script run करें
./docker-menu.sh

# 2. Menu से option select करें:
#    - Option 3: Build + Save (All in one)

# 3. Process complete होने का wait करें

# 4. File ready है:
#    robot-control-web.tar.gz
```

### Method 2: Command Line का उपयोग करें

```bash
# 1. Project directory में जाएं
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app

# 2. Image build और save करें
./docker-save-load.sh all

# Files बन जाएंगी:
# - robot-control-web.tar.gz (compressed image)
# - robot-control-web.tar.gz.sha256 (checksum)
```

### Method 3: Manual Docker Commands

```bash
# 1. Image build करें
docker-compose build

# 2. Image को save करें (compressed)
docker save robot-control-web:latest | gzip > robot-control-web.tar.gz

# 3. Checksum बनाएं (optional)
sha256sum robot-control-web.tar.gz > robot-control-web.tar.gz.sha256
```

---

## 💾 Tar File को दूसरी Machine पर Use करना

### Step 1: File Transfer करें

**USB Drive में:**
```bash
cp robot-control-web.tar.gz /media/usb/
```

**Network के through:**
```bash
scp robot-control-web.tar.gz user@remote-server:/path/
```

### Step 2: दूसरी Machine पर Load करें

```bash
# 1. File को destination machine पर copy करें

# 2. Image load करें
gunzip -c robot-control-web.tar.gz | docker load

# या script use करें
./docker-save-load.sh load-compressed

# 3. Container run करें
docker-compose up -d

# 4. Application access करें
# Browser: http://localhost:8000
```

---

## 📊 Commands Reference

### Build Commands

```bash
# Docker Compose से build
docker-compose build

# Script से build
./docker-save-load.sh build

# Rebuild without cache
docker-compose build --no-cache
```

### Save Commands

```bash
# Compressed format (Recommended - 60-70% smaller)
./docker-save-load.sh save-compressed
docker save robot-control-web:latest | gzip > robot-control-web.tar.gz

# Normal tar format
./docker-save-load.sh save
docker save robot-control-web:latest -o robot-control-web.tar
```

### Load Commands

```bash
# Compressed format से
./docker-save-load.sh load-compressed
gunzip -c robot-control-web.tar.gz | docker load

# Normal tar से
./docker-save-load.sh load
docker load -i robot-control-web.tar
```

### Run Commands

```bash
# Container start करें (background)
docker-compose up -d

# Container start करें (foreground with logs)
docker-compose up

# Container stop करें
docker-compose down

# Logs देखें
docker-compose logs -f

# Container status check करें
docker-compose ps
```

### Info Commands

```bash
# Image info
./docker-save-load.sh info

# Docker images list
docker images | grep robot-control-web

# Container info
docker-compose ps

# Disk usage
docker system df
```

### Cleanup Commands

```bash
# Tar files delete करें
./docker-save-load.sh clean

# Stopped containers remove करें
docker-compose down

# All unused images/containers remove करें
docker system prune -a

# Specific image remove करें
docker rmi robot-control-web:latest
```

---

## 🔧 Troubleshooting

### Problem 1: "Permission denied" error

**Solution:**
```bash
# Script को executable बनाएं
chmod +x docker-save-load.sh docker-menu.sh

# या sudo के साथ run करें
sudo ./docker-save-load.sh all
```

### Problem 2: "Image not found" error

**Solution:**
```bash
# पहले image build करें
./docker-save-load.sh build

# फिर save करें
./docker-save-load.sh save-compressed
```

### Problem 3: "No space left on device"

**Solution:**
```bash
# Disk space check करें
df -h

# Docker cleanup करें
docker system prune -a

# फिर से try करें
./docker-save-load.sh all
```

### Problem 4: "docker-compose: command not found"

**Solution:**
```bash
# Docker Compose install करें
sudo apt-get update
sudo apt-get install docker-compose

# या Docker Compose V2 use करें
docker compose build
```

### Problem 5: Checksum verification failed

**Solution:**
```bash
# File corrupt हो सकती है
# फिर से save करें
./docker-save-load.sh save-compressed

# या checksum ignore करें (not recommended)
gunzip -c robot-control-web.tar.gz | docker load
```

### Problem 6: Container not starting

**Solution:**
```bash
# Logs check करें
docker-compose logs

# Port already in use हो सकता है
sudo lsof -i :8000

# या container restart करें
docker-compose down
docker-compose up -d
```

---

## 📏 File Sizes (अनुमानित)

| Format | Size | Transfer Time (10 Mbps) |
|--------|------|-------------------------|
| Uncompressed tar | ~500-800 MB | ~7-11 minutes |
| Compressed tar.gz | ~200-300 MB | ~3-4 minutes |

**💡 Recommendation:** हमेशा compressed format use करें!

---

## ✅ Best Practices

1. **हमेशा compressed format use करें** - File size 60-70% कम होती है
2. **Checksum verify करें** - File corruption check करने के लिए
3. **Regular backups लें** - Important images का backup रखें
4. **Tag versions properly** - Different versions track करने के लिए
5. **Disk space monitor करें** - Save करने से पहले space check करें
6. **Test after loading** - Load करने के बाद container test करें

---

## 🎯 Common Use Cases

### Use Case 1: Development to Production

```bash
# Development machine पर
./docker-save-load.sh all
scp robot-control-web.tar.gz production-server:/tmp/

# Production server पर
cd /path/to/app
./docker-save-load.sh load-compressed
docker-compose up -d
```

### Use Case 2: Offline Installation

```bash
# Online machine पर
./docker-save-load.sh all
cp robot-control-web.tar.gz /media/usb/

# Offline machine पर
cp /media/usb/robot-control-web.tar.gz .
./docker-save-load.sh load-compressed
docker-compose up -d
```

### Use Case 3: Backup and Restore

```bash
# Backup
./docker-save-load.sh save-compressed
cp robot-control-web.tar.gz ~/backups/backup-$(date +%Y%m%d).tar.gz

# Restore
cp ~/backups/backup-20260210.tar.gz robot-control-web.tar.gz
./docker-save-load.sh load-compressed
```

---

## 📞 Quick Help

```bash
# Help देखें
./docker-save-load.sh help

# Interactive menu
./docker-menu.sh

# Docker Compose help
docker-compose --help

# Docker help
docker --help
```

---

## 🎉 Summary

**सबसे आसान तरीका:**
```bash
./docker-save-load.sh all
```

यह command:
- ✅ Image build करेगा
- ✅ Compressed tar.gz file बनाएगा
- ✅ Checksum generate करेगा
- ✅ Information display करेगा

**File ready:** `robot-control-web.tar.gz`

अब आप इस file को कहीं भी transfer कर सकते हैं और `docker load` command से use कर सकते हैं!

---

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose Documentation: https://docs.docker.com/compose/
- Project README: `README.md`
- Docker Guide: `DOCKER_GUIDE.md`

---

**Happy Dockerizing! 🐳**
