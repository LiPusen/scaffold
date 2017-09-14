var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

//vue相关的公共配置
module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction
  }),
  postcss: [
		require('autoprefixer')({
			browsers: ['last 100 versions']
		})
	],
}
