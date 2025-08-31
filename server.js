const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const port = 8080;
const distPath = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Generate random game ID
function generateGameId() {
  return crypto.randomBytes(4).toString('hex');
}

// Get WebSocket URL from environment or construct from host
function getWebSocketUrl(req, gameId) {
  const host = req.headers.host;
  return `ws://${host}/ws/${gameId}`;
}

// Parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Health check
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('healthy');
    return;
  }

  // API endpoints
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // Create game
      if (url.pathname === '/api/games' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const gameId = generateGameId();
        const websocketUrl = getWebSocketUrl(req, gameId);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          gameId,
          websocketUrl,
          name: body.name
        }));
        return;
      }
      
      // Join game
      if (url.pathname.match(/^\/api\/games\/[^\/]+\/join$/) && req.method === 'POST') {
        const gameId = url.pathname.split('/')[3];
        const websocketUrl = getWebSocketUrl(req, gameId);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          gameId,
          websocketUrl
        }));
        return;
      }
      
      // API not found
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
      
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid request' }));
      return;
    }
  }

  // Static file serving
  let filePath = path.join(distPath, url.pathname === '/' ? 'index.html' : url.pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve index.html for SPA routing
      filePath = path.join(distPath, 'index.html');
    }
    
    // Get file extension and MIME type
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
