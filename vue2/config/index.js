var path = require('path')
// 编译参数配置, 包括热启动和构建
module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    productionSourceMap: true,
    // 是否启动文件压缩
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // 模块分析报告
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8005,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/v4': {
        target: 'http://m.maizuo.com',
        changeOrigin: true,
        pathRewrite: {
          '^/v4': '/v4'
        }
      }
    },
    // css文件路径映射
    cssSourceMap: false
  }
}
