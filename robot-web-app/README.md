# Robot Control Web App

## Setup

1.  Navigate to the project directory:
    ```bash
    cd /home/vlabuser2/.gemini/antigravity/scratch/robot-web-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Ensure scripts are executable (if not already):
    ```bash
    chmod +x scripts/*.sh
    ```

## Running the App

Start the server:

```bash
npm start
```

Then open your browser and go to:
`http://localhost:8000` (or your server's IP address).

## Structure
-   `server.js`: Node.js Express server + Socket.IO source.
-   `public/`: Frontend assets (HTML, CSS, JS).
-   `scripts/`: Validation scripts executed by the server.
