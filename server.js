const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Application is running',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CI/CD Demo App</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
        }
        .container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin: 15px 0; }
        .badge {
          display: inline-block;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          margin: 10px;
        }
        .success { color: #4ade80; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 CI/CD Pipeline Success!</h1>
        <p class="success">✅ Application deployed successfully</p>
        <div>
          <span class="badge">Build: ${process.env.BUILD_NUMBER || 'local'}</span>
          <span class="badge">Version: ${process.env.APP_VERSION || '1.0.0'}</span>
          <span class="badge">Environment: ${process.env.NODE_ENV || 'production'}</span>
        </div>
        <p style="margin-top: 30px;">Deployed via Jenkins Pipeline</p>
      </div>
    </body>
    </html>
  `);
});

// API endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Node.js CI/CD Application',
    version: process.env.APP_VERSION || '1.0.0',
    buildNumber: process.env.BUILD_NUMBER || 'N/A',
    environment: process.env.NODE_ENV || 'production',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Version: ${process.env.APP_VERSION || '1.0.0'}`);
});

module.exports = app;
