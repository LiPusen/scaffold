const axios = require('axios');
// 将对象转化成from数据格式
const qs = require('qs');
const cof = require("../config");

// 实例化请求
const xhr = axios.create({timeout: 5000});

const oauthB = (token) => {
    xhr.post(cof.bsUr.oauth, 'token=' + token, { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8','Authorization': cof.os.b } }).then(data => {
        console.log(data.data, 1);
        return true;
    }, er => {
        console.log(er.response.data.message, 0);
        return false;
    })
}

module.exports = {
    oauthB
}