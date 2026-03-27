const http = require('http');

const CONTACT = 'clocicovalexandru@gmail.com';
const PORT = 8080;

http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const ip = parsedUrl.searchParams.get('ip');

  if (!ip) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Missing ip parameter' }));
    return;
  }

  const apiUrl = `http://check.getipintel.net/check.php?ip=${encodeURIComponent(ip)}&contact=${CONTACT}&flags=f&oflags=bca&format=json`;

  console.log(`[${new Date().toISOString()}] Checking IP: ${ip}`);

  const apiReq = http.get(apiUrl, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  });

  apiReq.on('error', (err) => {
    console.error('API request error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Failed to reach GetIPIntel API' }));
  });

  apiReq.setTimeout(10000, () => {
    apiReq.destroy();
    res.writeHead(504, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Request timed out' }));
  });

}).listen(PORT, () => {
  console.log(`✅ GetIPIntel proxy running at http://localhost:${PORT}`);
  console.log(`   Usage: http://localhost:${PORT}/?ip=8.8.8.8`);
});