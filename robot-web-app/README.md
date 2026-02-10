# Robot Control Web UI 🤖

A web-based control interface for managing and controlling robots (ZippyX, Zippy40, and Forklift).

## Features ✨

- **Real-time Robot Control**: Control robots through an intuitive web interface
- **Multiple Robot Types**: Support for ZippyX, Zippy40, and Forklift robots
- **Teleop Mode**: Direct keyboard control (WASD keys)
- **Maintenance Mode**: Lifter control for maintenance operations
- **Live Terminal**: Real-time command output and telemetry data
- **Connection Testing**: Ping robots to check connectivity
- **Responsive Design**: Works on desktop and mobile browsers

## Quick Start 🚀

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage 📖

1. **Login**: Use the login page to access the control interface
2. **Select Robot**: Choose your robot type and enter the robot number
3. **Connect**: Test connection using the ping feature
4. **Control**: Use the various control modes:
   - **Teleop**: Direct movement control
   - **Maintenance**: Lifter control
   - **Validation**: Run diagnostic commands

## Deployment 🌐

### Local Network Access

Your server runs on port **8000** and is accessible from any device on your network:

```
http://YOUR_LOCAL_IP:8000
```

To find your local IP:
```bash
hostname -I | awk '{print $1}'
```

### Public Deployment

For detailed deployment instructions to make your app accessible from anywhere, see:

📖 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

This guide covers:
- Uploading to GitHub
- Deploying to cloud servers (AWS, DigitalOcean, etc.)
- Setting up domain names
- Enabling HTTPS
- Quick deployment options (Heroku, Render, Railway)

## Project Structure 📁

```
robot-web-app/
├── server.js              # Main server file (Node.js + Express + Socket.IO)
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── login.html        # Login page
│   ├── index.html        # Main control interface
│   └── styles/           # CSS files
├── scripts/              # Robot control scripts
│   ├── xvalidationzippyx.sh
│   ├── xvalidationzippy40.sh
│   └── xvalidationforklift.sh
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## Configuration ⚙️

### Port Configuration

The server runs on port 8000 by default. To change it, edit `server.js`:

```javascript
const PORT = 8000; // Change this to your desired port
```

### Robot Configuration

Robot settings are configured in `server.js`:

```javascript
const ROBOT_CONFIG = {
    username: 'zippy',
    password: 'zippy',
    ipPrefix: '10.30.72.',
    offsetIP: 60
};
```

## Technologies Used 💻

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML, CSS, JavaScript
- **Terminal**: node-pty, xterm.js
- **Real-time Communication**: WebSockets

## Sharing with Users 🔗

Once deployed, users can access your robot UI by simply opening the URL in any modern web browser:

- **Chrome** ✅
- **Firefox** ✅
- **Safari** ✅
- **Edge** ✅
- **Mobile browsers** ✅

### Example URLs:

- Local: `http://localhost:8000`
- Network: `http://192.168.1.100:8000`
- Public: `http://your-server-ip:8000`
- Domain: `http://yourdomain.com`

## Troubleshooting 🔧

### Port Already in Use

```bash
# Find what's using port 8000
sudo lsof -i :8000

# Kill the process
sudo kill -9 PID
```

### Can't Access from Other Devices

- Check firewall settings
- Ensure server is listening on `0.0.0.0` (already configured)
- Verify devices are on the same network

### Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License.

## Support 💬

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for Robot Control**
