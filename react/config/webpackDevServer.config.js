'use strict';

//错误处理中间件
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const config = require('./webpack.config.dev');
const paths = require('./paths');

//支持https协议
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function(proxy, allowedHost) {
  return {
    // 防止远程网站通过DNS重定向访问本地服务,就像云端协调开发的场景,本地代码编译不考虑安全性,但是通过重定向之后会有一定安全隐患暴露出来
    // 我们禁用本地DNS解析,如果使用'proxy',则会解除这种限制.你如果确定你需要什么样的开发环境,就可以重写下面的配置
    disableHostCheck:
      !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    // 启用服务器端文件压缩.
    compress: true,
    // 静默webpackDevServer的日志输出,但是报错信息及一些设置细节还会继续输出
    clientLogLevel: 'none',
    // 默认情况下,dev服务从本地路径构建虚拟目录建立服务,build时从虚拟目录里面将文件copy到相应目录里面,配置只需要从模板文件夹复制静态文件就可以了
    // 在js引入静态文件路径需要添加PUBLIC_URL在路径前,webpack会自动替换
    contentBase: paths.appPublic,
    // 开启静态文件监控
    watchContentBase: true,
    // 热更新,通过sockjs实时更新
    hot: true,
    // 服务根目录
    publicPath: config.output.publicPath,
    // 开启自定义消息发送
    quiet: true,
    // 为了防止服务器CPU过载,排除对node_modules的监控
    watchOptions: {
      ignored: /node_modules/,
    },
    // 需要开启支持https的时候在环境变量里面设置https
    https: protocol === 'https',
    host: host,
    overlay: false,
    historyApiFallback: {
      // 支持历史记录返回
      disableDotRule: true,
    },
    public: allowedHost,
    proxy,
    setup(app) {
      // 爆出错误后,可以通过错误信息定位文件.
      app.use(errorOverlayMiddleware());
      // 缓存相关数据,和主机使用了相同的IP和端口
      app.use(noopServiceWorkerMiddleware());
    },
  };
};
