'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// 拿到运行环境变量之后再使用路径配置文件paths的参数,清除服务器系统缓存.
delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
	//未定义的环境变量
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

//过滤出有值的参数
var dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  // 设置在测试环境为模拟的线上环境,其他为本地环境,保证测试的准确性
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  paths.dotenv,
].filter(Boolean);

// 静默环境变量日志,如果你设置的变量异常也不会报错使用之前保持的环境变量进行运行
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv').config({
      path: dotenvFile,
    });
  }
});

// 配置webpack运行环境参数
const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        // 设置是否是生成环境,并使用正确的webpack配置进行编译
        NODE_ENV: process.env.NODE_ENV || 'development',
        // 配置静态文件路径,当前静态文件放置在 `public`文件夹.
        // eg: <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // 正常情况下应该在'src'或'import'里面设置图片路径
        PUBLIC_URL: publicUrl,
      }
    );
  // 序列化所有的环境变量并把它们注入到webpack配置里面
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;
