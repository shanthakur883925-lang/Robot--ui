# Docker Image Save/Load Guide

यह guide आपको बताएगी कि कैसे Docker image को build करें और tar file में save करें।

## Quick Start (तुरंत शुरू करें)

### एक ही command में सब कुछ करें:
```bash
./docker-save-load.sh all
```

यह command:
1. Docker image build करेगा
2. Image को compressed tar.gz file में save करेगा
3. File की जानकारी दिखाएगा

---

## Available Commands (उपलब्ध Commands)

### 1. Docker Image Build करें
```bash
./docker-save-load.sh build
```
या
```bash
docker-compose build
```

### 2. Image को Tar File में Save करें

#### Normal Tar File (बड़ी file):
```bash
./docker-save-load.sh save
```
या
```bash
docker save robot-control-web:latest -o robot-control-web.tar
```

#### Compressed Tar File (छोटी file - Recommended):
```bash
./docker-save-load.sh save-compressed
```
या
```bash
docker save robot-control-web:latest | gzip > robot-control-web.tar.gz
```

### 3. Tar File से Image Load करें

#### Normal Tar File से:
```bash
./docker-save-load.sh load
```
या
```bash
docker load -i robot-control-web.tar
```

#### Compressed Tar File से:
```bash
./docker-save-load.sh load-compressed
```
या
```bash
gunzip -c robot-control-web.tar.gz | docker load
```

### 4. Image की जानकारी देखें
```bash
./docker-save-load.sh info
```

### 5. Tar Files को Delete करें
```bash
./docker-save-load.sh clean
```

---

## Step-by-Step Process (विस्तृत प्रक्रिया)

### पहली बार Image बनाना और Save करना:

1. **Project directory में जाएं:**
   ```bash
   cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
   ```

2. **Docker image build करें:**
   ```bash
   ./docker-save-load.sh build
   ```
   
3. **Image को compressed tar file में save करें:**
   ```bash
   ./docker-save-load.sh save-compressed
   ```
   
   यह create करेगा:
   - `robot-control-web.tar.gz` - Compressed image file
   - `robot-control-web.tar.gz.sha256` - Checksum file (verification के लिए)

4. **File की जानकारी देखें:**
   ```bash
   ls -lh robot-control-web.tar.gz
   ```

---

## Docker Compose के साथ Complete Workflow

### Build और Run करें:
```bash
# Image build करें
docker-compose build

# Container start करें
docker-compose up -d

# Logs देखें
docker-compose logs -f

# Container stop करें
docker-compose down
```

### Image को Save करें:
```bash
# Compressed format में save करें (recommended)
docker save robot-control-web:latest | gzip > robot-control-web.tar.gz

# या normal tar file
docker save robot-control-web:latest -o robot-control-web.tar
```

### दूसरी Machine पर Image Load करें:
```bash
# Compressed file से load करें
gunzip -c robot-control-web.tar.gz | docker load

# या normal tar file से
docker load -i robot-control-web.tar

# अब docker-compose से run करें
docker-compose up -d
```

---

## File Sizes (अनुमानित आकार)

- **Uncompressed tar**: ~500-800 MB
- **Compressed tar.gz**: ~200-300 MB (60-70% छोटा)

**Recommendation**: हमेशा compressed format (`save-compressed`) use करें क्योंकि:
- File size बहुत कम होती है
- Transfer करना आसान होता है
- Storage कम लगती है

---

## Transfer करने के तरीके

### 1. USB Drive में Copy करें:
```bash
cp robot-control-web.tar.gz /media/usb/
```

### 2. Network के through Transfer करें:
```bash
# SCP से
scp robot-control-web.tar.gz user@remote-server:/path/to/destination/

# या rsync से
rsync -avz robot-control-web.tar.gz user@remote-server:/path/to/destination/
```

### 3. Cloud Storage में Upload करें:
```bash
# Google Drive, Dropbox, etc. में upload करें
```

---

## Troubleshooting (समस्या समाधान)

### Problem: "Image not found" error
**Solution:**
```bash
# पहले image build करें
./docker-save-load.sh build
```

### Problem: "Permission denied" error
**Solution:**
```bash
# Script को executable बनाएं
chmod +x docker-save-load.sh

# या sudo के साथ run करें
sudo ./docker-save-load.sh all
```

### Problem: Checksum verification failed
**Solution:**
```bash
# File corrupt हो सकती है, फिर से save करें
./docker-save-load.sh save-compressed
```

### Problem: Disk space full
**Solution:**
```bash
# पुरानी images और containers clean करें
docker system prune -a

# फिर से try करें
./docker-save-load.sh all
```

---

## Important Notes (महत्वपूर्ण बातें)

1. **Compressed format use करें**: हमेशा `save-compressed` option use करें, file size 60-70% कम होती है

2. **Checksum verify करें**: Load करने से पहले checksum verify करें कि file corrupt तो नहीं है

3. **Disk space check करें**: Image save करने से पहले sufficient disk space होना चाहिए

4. **Docker running होना चाहिए**: सभी commands के लिए Docker daemon running होना जरूरी है

5. **Backup रखें**: Important images का backup जरूर रखें

---

## Quick Reference Commands

```bash
# सब कुछ एक साथ (Build + Save + Info)
./docker-save-load.sh all

# सिर्फ Build करें
./docker-save-load.sh build

# Compressed format में Save करें
./docker-save-load.sh save-compressed

# Load करें
./docker-save-load.sh load-compressed

# Information देखें
./docker-save-load.sh info

# Clean up करें
./docker-save-load.sh clean

# Help देखें
./docker-save-load.sh help
```

---

## Example Workflow (उदाहरण)

```bash
# 1. Project directory में जाएं
cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app

# 2. Image build और save करें
./docker-save-load.sh all

# 3. File को USB या network से transfer करें
cp robot-control-web.tar.gz /path/to/destination/

# 4. दूसरी machine पर load करें
./docker-save-load.sh load-compressed

# 5. Container run करें
docker-compose up -d

# 6. Application access करें
# Browser में खोलें: http://localhost:8000
```

---

## Support

अगर कोई problem आए तो:
1. `./docker-save-load.sh help` command run करें
2. Docker logs check करें: `docker-compose logs`
3. System resources check करें: `docker system df`
