require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

//自动打开浏览器
var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
//重定向中间件
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// 监听端口
var port = process.env.PORT || config.dev.port
// 自动打开浏览器开关,未设置的话默认关闭
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// 定义HTTP请求重定向
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

// webpack服务开启目录中间件
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

// webpack热更新中间件
var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// 当模板文件发生改变时强制刷新页面
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// 重定向参数配置
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  // 接口过滤
  app.use(proxyMiddleware(options.filter || context, options))
})

// 加载vue历史记录记忆功能,类似于浏览器历史记录
app.use(require('connect-history-api-fallback')())

// 加载服务中间件
app.use(devMiddleware)

// 含编译错误处理方法
app.use(hotMiddleware)

// 建立虚拟静态路径
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  if (autoOpenBrowser) {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
