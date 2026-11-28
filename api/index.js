let app;
try {
  app = require('../server/index.js');
} catch (err) {
  console.error('[API Init Error]:', err);
}

module.exports = (req, res) => {
  if (!app) {
    try {
      app = require('../server/index.js');
    } catch (err) {
      console.error('[API Lazy Load Error]:', err);
      return res.status(500).json({ error: 'Failed to initialize backend server application', details: err.message });
    }
  }

  // Normalize URL for Vercel serverless functions
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};

// EduManage Bharat · AI Genesis Challenge
