const { createProxyMiddleware } = require('http-proxy-middleware');

const REAL_SEARCH_TARGET = process.env.REAL_SEARCH_TARGET;
const REAL_SEARCH_SESSION =
  process.env.REAL_SEARCH_SESSION
  || process.env.REACT_APP_REAL_SEARCH_SESSION
  || 'test-session';

module.exports = function setupProxy(app) {
  app.use(
    '/api/real-search',
    createProxyMiddleware({
      target: REAL_SEARCH_TARGET,
      changeOrigin: true,
      pathRewrite: {
        '^/api/real-search': '/svc/cvsearch/search',
      },
      onProxyReq(proxyReq, req) {
        // Ensure the Atollon session header is always forwarded
        proxyReq.setHeader('X-Atollon-Session', req.headers['x-atollon-session'] || REAL_SEARCH_SESSION);

        // CRA's dev server strips Referer by default; add one to mimic the browser run
        if (!proxyReq.getHeader('referer') && req.headers.referer) {
          proxyReq.setHeader('referer', req.headers.referer);
        }
      },
      logLevel: 'warn',
    })
  );

  // Proxy for CV metadata endpoint
  app.use(
    '/api/cv-metadata',
    createProxyMiddleware({
      target: REAL_SEARCH_TARGET,
      changeOrigin: true,
      pathRewrite: (path) => {
        const params = new URLSearchParams(path.split('?')[1] || '');
        const cvId = params.get('cvId');
        return `/svc/cvsearch/cv/${cvId}/metadata`;
      },
      onProxyReq(proxyReq, req) {
        proxyReq.setHeader('X-Atollon-Session', req.headers['x-atollon-session'] || REAL_SEARCH_SESSION);
      },
      logLevel: 'warn',
    })
  );
};

