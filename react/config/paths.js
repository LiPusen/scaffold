'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// 模块引入对特殊符号进行处理,从环境或者从项目中获取正确的路径:
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// 从环境变量里面获取公共路径,一般设置服务器端的绝对路径
const envPublicUrl = process.env.PUBLIC_URL;

//路径处理
function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

// 设置js的引入路径
function getServedPath() {
  const servedUrl = envPublicUrl ||  './';
  return ensureSlash(servedUrl, true);
}

// 配置路径参数
module.exports = {
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: envPublicUrl,
  servedPath: getServedPath(),
};
