module.exports = {
  devServer: {
     proxy: {
      '^/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/', // rewrite path
        }
      },
      '^/web_model': {
        target: 'http://localhost:9000',
        changeOrigin: true
      }
    }
  }
}
