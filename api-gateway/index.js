const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Route to user-service
app.use('/api/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));
app.use('/api/teams', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));

// Route to game-service
app.use('/api/games', createProxyMiddleware({ target: 'http://game-service:3002', changeOrigin: true }));

// Route to analytics-service
app.use('/api/analytics', createProxyMiddleware({ target: 'http://analytics-service:3004', changeOrigin: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
