// axios请求插件
const axios = require('axios');
// 全局配置参数
const cof = require('../config');

// 实例化请求
const xhr = axios.create({timeout: 5000});

// 用户合法性校验中间件
const bCheckUser = (req, res, next) => {
    xhr.post(cof.bsUr.oauth, 'token=' + req.headers.session, { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8','Authorization': cof.os.b } }).then(data => {
        console.log(data.data)
        next();
    }, er => {
        res.status(401).send('session失效，请重新登陆！');
    })
}

module.exports = {
    bCheckUser
}