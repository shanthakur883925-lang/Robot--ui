# 🐳 Docker Image Load करने का तरीका

## 📦 Available Files

आपके पास 2 tar files हैं:

1. **robot-control-web.tar** (669 MB) - Uncompressed
2. **robot-control-web.tar.gz** (252 MB) - Compressed ⭐ Recommended

---

## 🚀 Server पर Image Load करना

### Method 1: Compressed File से (Recommended - Faster Transfer)

```bash
# 1. File को server पर transfer करें
scp robot-control-web.tar.gz user@server:/path/to/destination/

# 2. Server पर SSH करें
ssh user@server

# 3. Directory में जाएं
cd /path/to/destination/

# 4. Checksum verify करें (optional but recommended)
sha256sum -c robot-control-web.tar.gz.sha256

# 5. Image load करें
gunzip -c robot-control-web.tar.gz | docker load

# या एक line में:
docker load < <(gunzip -c robot-control-web.tar.gz)
```

### Method 2: Normal Tar File से

```bash
# 1. File को server पर transfer करें
scp robot-control-web.tar user@server:/path/to/destination/

# 2. Server पर SSH करें
ssh user@server

# 3. Directory में जाएं
cd /path/to/destination/

# 4. Checksum verify करें (optional)
sha256sum -c robot-control-web.tar.sha256

# 5. Image load करें
docker load -i robot-control-web.tar

# या
docker load < robot-control-web.tar
```

---

## ✅ Verify करें कि Image Load हो गया

```bash
# Images list देखें
docker images | grep robot-control-web

# Output होगा:
# robot-control-web   latest   45778ace3e65   X minutes ago   691MB
```

---

## 🏃 Container Run करें

### Option 1: Docker Compose के साथ (Recommended)

```bash
# 1. docker-compose.yml file भी transfer करें
scp docker-compose.yml user@server:/path/to/destination/

# 2. Container start करें
docker-compose up -d

# 3. Status check करें
docker-compose ps

# 4. Logs देखें
docker-compose logs -f
```

### Option 2: Direct Docker Command

```bash
# Container run करें
docker run -d \
  --name robot-control-web \
  -p 8000:8000 \
  -e NODE_ENV=production \
  -e PORT=8000 \
  --restart unless-stopped \
  robot-control-web:latest

# Status check करें
docker ps | grep robot-control-web

# Logs देखें
docker logs -f robot-control-web
```

---

## 🌐 Application Access करें

```
http://server-ip:8000
```

या local machine पर:
```
http://localhost:8000
```

---

## 📊 File Size Comparison

| File | Size | Transfer Time (10 Mbps) |
|------|------|-------------------------|
| robot-control-web.tar | 669 MB | ~9 minutes |
| robot-control-web.tar.gz | 252 MB | ~3.5 minutes |

**💡 Recommendation:** Compressed file use करें - 62% छोटी है!

---

## 🔐 Checksums (Verification के लिए)

### robot-control-web.tar
```
a4c059cea6a818d4d672e534e5634a606aa01de2cb8de829536f15041afe24d9
```

### robot-control-web.tar.gz
```
b6f8a0ae42d79aa51265f43df0df3068a6d59069076b6e0e9cbb07256af5f1a8
```

---

## 🔧 Troubleshooting

### Problem: "No space left on device"
```bash
# Disk space check करें
df -h

# Old images/containers clean करें
docker system prune -a
```

### Problem: "Cannot connect to Docker daemon"
```bash
# Docker service start करें
sudo systemctl start docker

# या
sudo service docker start
```

### Problem: Port 8000 already in use
```bash
# Port check करें
sudo lsof -i :8000

# या दूसरा port use करें
docker run -p 8080:8000 robot-control-web:latest
```

---

## 📝 Complete Example Workflow

```bash
# === Local Machine (जहाँ image बनाई है) ===

# 1. Files को server पर transfer करें
scp robot-control-web.tar.gz \
    robot-control-web.tar.gz.sha256 \
    docker-compose.yml \
    user@server:/home/user/robot-app/

# === Remote Server ===

# 2. Server पर SSH करें
ssh user@server

# 3. Directory में जाएं
cd /home/user/robot-app/

# 4. Checksum verify करें
sha256sum -c robot-control-web.tar.gz.sha256

# 5. Image load करें
gunzip -c robot-control-web.tar.gz | docker load

# 6. Verify करें
docker images | grep robot-control-web

# 7. Container start करें
docker-compose up -d

# 8. Status check करें
docker-compose ps

# 9. Logs देखें
docker-compose logs -f

# 10. Browser में access करें
# http://server-ip:8000
```

---

## 🎯 Quick Commands Reference

```bash
# Load compressed image
gunzip -c robot-control-web.tar.gz | docker load

# Load normal tar
docker load -i robot-control-web.tar

# Verify checksum
sha256sum -c robot-control-web.tar.gz.sha256

# List images
docker images

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down

# Remove image
docker rmi robot-control-web:latest
```

---

## ✨ Summary

1. ✅ **Image built:** robot-control-web:latest (691 MB)
2. ✅ **Saved as tar:** robot-control-web.tar (669 MB)
3. ✅ **Saved as tar.gz:** robot-control-web.tar.gz (252 MB) ⭐
4. ✅ **Checksums created:** For verification
5. ✅ **Ready to transfer:** Use compressed version

**अब आप इन files को किसी भी server पर transfer करके use कर सकते हैं!** 🎉
