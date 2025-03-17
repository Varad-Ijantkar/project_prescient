const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // This is kept for backward compatibility, but it might not be called
    app.use(
        '/api/employees',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            pathRewrite: { '^/api/employees': '' },
            onProxyReq: (proxyReq, req) => {
                console.log('Proxying request (app.use):', req.method, req.url);
                if (req.headers['content-type']) {
                    proxyReq.setHeader('Content-Type', req.headers['content-type']);
                }
            },
        })
    );
};

// Modern approach using setupMiddlewares
module.exports.setupMiddlewares = (middlewares, devServer) => {
    if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
    }

    console.log('Setting up proxy middleware via setupMiddlewares');

    devServer.app.use(
        '/api/employees',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            pathRewrite: { '^/api/employees': '' },
            onProxyReq: (proxyReq, req) => {
                console.log('Proxying request (setupMiddlewares):', req.method, req.url);
                if (req.headers['content-type']) {
                    proxyReq.setHeader('Content-Type', req.headers['content-type']);
                }
            },
        })
    );

    return middlewares; // Ensure other middlewares are preserved
};