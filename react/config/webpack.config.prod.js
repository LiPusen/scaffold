'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 分类打包插件
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 生成manifest.json文件,方便搜索引擎查找
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
// 缓存项目依赖项,异步载入,提高性能
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

// 编译后文件的顶层目录 
const publicPath = paths.servedPath;
// 是否使用相对路径
const shouldUseRelativeAssetPaths = publicPath === './';
// 是否生成依赖树,进行调试
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const publicUrl = publicPath.slice(0, -1);
// 导入环境变量.
const env = getClientEnvironment(publicUrl);

// 生产环境参数配置
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

// 定义存放css文件路径.
const cssFilename = 'static/css/[name].[contenthash:8].css';

// build分类打包后输出配置选项.保证输出到build文件夹里面的路径
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

// 生产环境的配置参数,构建较慢,但是会分类打包最小的文件,性能已优化
module.exports = {
  // 如果检测出编译错误将错误日志打出,阻断编译.
  bail: true,
  // 生成map文件,方便更快编译,在上线部署的时候可以删掉
  devtool: shouldUseSourceMap ? 'source-map' : false,
  // 在生产环境里,只需要引入 polyfills到你的代码里就可以了.
  entry: [require.resolve('./polyfills'), paths.appIndexJs],
  output: {
    // 输出的文件夹.
    path: paths.appBuild,
    // 编译后的js文件名称及路径,里面没有做代码分割,但是webpack有这个能力,可以异步加载所需js
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    // 所有编译文件的顶级目录.
    publicPath: publicPath,
    // 将本地文件路径,转换成http协议地址
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
  },
  resolve: {
    // 添加备用模块目录,从环境变量里获得
    modules: ['node_modules', paths.appNodeModules].concat(
    // 一定存在环境变量,因为通过env.js设置了默认值
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    // 文件扩展名缺省
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    alias: {},
    plugins: [
      // 只允许从src或node_modules引入模块,并且保证只有通过webpack进行编译,以免发生混乱.
      new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
  },
  module: {
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
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.(js|jsx)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            options: {
              compact: true,
            },
          },
          // css依赖载入 兼容处理 打包进js 从js里面分离 分类打包 路径替换
          {
            test: /\.(css|less)$/,
            loader: ExtractTextPlugin.extract(
              Object.assign(
                {
                  fallback: require.resolve('style-loader'),
                  use: [
                    {
                      loader: require.resolve('css-loader'),
                      options: {
                        importLoaders: 1,
                        minimize: true,
                        sourceMap: shouldUseSourceMap,
                      },
                    },
                    {
                      loader: require.resolve('postcss-loader'),
                      options: {
                        // 前提条件是通过依赖路径导入css
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
                extractTextPluginOptions
              )
            ),
            // 必须在插件系统里面进行声明new ExtractTextPlugin()不然这里的配置不会生效.
          },
          // 文件的路径管理
          {
            loader: require.resolve('file-loader'),
            // 路径追踪
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // 对模板html里面的变量进行替换
    new InterpolateHtmlPlugin(env.raw),
    // 路径引入页面组装.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // 根据环境变量进行更新
    new webpack.DefinePlugin(env.stringified),
    // 压缩js代码.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
        // 支持ascii编码,保证转义正确
        ascii_only: true,
      },
      sourceMap: shouldUseSourceMap,
    }),
    // 声明分割规则,必须有,不然相关配置失效.
    new ExtractTextPlugin({
      filename: cssFilename,
    }),
    // 生成一个静态的清单映射,输出到HTML页面
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    // 生成一个服务器的缓存文件,保证改动最新
    new SWPrecacheWebpackPlugin({
      // 添加请求hash参数,防止缓存的影响
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'servcache.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          // 每一步构建都会有这样的日志,屏蔽掉!!!.
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          // 无关的错误信息,也不需要出现
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: publicUrl + '/index.html',
      // 去掉绝对路径
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      // 不需要加到映射表的文件
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    // Moment.js 模块引用
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  // node独有的模块,但是浏览器不识别,需要置空
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
