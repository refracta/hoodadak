const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/websocket', {
            target: 'http://localhost:5000',
            changeOrigin: true,
            ws: true,
            secure: false
        })
    );
};