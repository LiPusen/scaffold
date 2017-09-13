'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//模块和路径管理
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
//html模板编译插件
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');

// 在开发模式下,页面始终在根目录下渲染,采取绝对路径进行资源引入.
const publicPath = '/';
// `publicUrl` 和 `publicPath` 类似, 可以让引入路径更加优雅
const publicUrl = '';
// 获得环境变量.
const env = getClientEnvironment(publicUrl);

// 开发环境的独立配置参数,可以更快速的完成构建和更新
module.exports = {
  // 辅助定位开发错误 开启调试工具
  devtool: 'cheap-module-source-map',
  // 两个入口文件,确保可以自动更新js,依据入口文件通过节点树查找依赖模块.
  entry: [
    // 核心方法兼容:
    require.resolve('./polyfills'),
    // 建立热更新服务器,通过即时服务将监控文件的改变实时编译更新到页面,还可以有两种写法:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    // 最后这是真正入口文件配置,配置项会依次运行:
    paths.appIndexJs,
    // 这样的配置保证了,在运行中出错时不会挂起服务,仍然会继续编译js
  ],
  output: {
    // 开发环境中不会真正输出文件,但是没有这个配置项,webpack开发服务器将崩溃:
    path: paths.appBuild,
    // 根据依赖生成路径信息.
    pathinfo: true,
    // 开发环境中生成的一个虚拟的路径,并且组装到html页面
    filename: 'static/js/bundle.js',
    // 如果需要分类打包,也会有相应的js生成.
    chunkFilename: 'static/js/[name].chunk.js',
    // 服务的根路径,设置成虚拟文件的存放路径.
    publicPath: publicPath,
    // 将本地路径转换成URL
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    // 对依赖模块路径进行备份,当编译节点发生冲突时进行匹配
    modules: ['node_modules', paths.appNodeModules].concat(
      // 根据获得的环境变量再次进行依赖合并
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // 扩展名缺省自动匹配,'web'类的文件为Native的扩展文件
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {},
    plugins: [
      // 只允许从src或node_modules引入模块,并且保证只有通过webpack进行编译,以免发生混乱.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  },
  module: {
  	//严格模式开启
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
              
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appSrc,
      },
      {
       //对文件进行编译时,如果第一段编译插件失败转而进行下一步编译直到成功
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // 编译js|jsx文件.
          {
            test: /\.(js|jsx)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              //开启缓存机制让编译更快
              cacheDirectory: true,
            },
          },
          {
            test: /\.(css|less)$/,
            use: [
              require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  //对import引入的css文件进行兼容处理
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
              {
					      loader: require.resolve('less-loader') // compiles Less to CSS
					    },
            ],
          },
          // 文件路径系统管理,在开发环境,引入一个静态资源时,它会生成一个虚拟的文件名称和文件路径.
          {
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 根据环境变量给html注入路径等信息
    new InterpolateHtmlPlugin(env.raw),
    // 将js注入html.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    // 生成文件索引.
    new webpack.NamedModulesPlugin(),
    // 将环境变量转换成webpack可以识别的变量
    new webpack.DefinePlugin(env.stringified),
    // 对提交代码进行直接更新,目前只支持css:
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    // 如果有新的模块被安装,可以重新识别并启动编译服务
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // 对时间进行格式化,方便生成日志,如果你感觉用处不大可以删掉
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  // 可能在源码里面引入一些浏览器不能识别的模块,这些模块属于node,通过设置可以将这些模块的引入数据清空
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  // 关掉webpack对项目的性能检测,在开发环境中不需要考虑性能问题
  performance: {
    hints: false,
  },
};
