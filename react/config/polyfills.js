'use strict';

if (typeof Promise === 'undefined') {
  // 特别处理兼容es6的Promise语法实现
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// 载入polyfill模块.
require('whatwg-fetch');

// Object.assign() 是一个react的核心方法,针对这个函数进行兼容处理,包括兼容native.
Object.assign = require('object-assign');
