const app = require('../server/index.js');

module.exports = (req, res) => {
  // Normalize URL for Vercel serverless functions
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
};
