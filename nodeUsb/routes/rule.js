// 接口规范
const rule = (code, data) => {
    switch (code) {
        case 200:
            return {code, msg: '请求成功！', body: data};
        case 301:
            return {code, msg: '查无数据！', body: {}};
        case 401:
            return {code, msg: 'session失效，请重新登陆！', body: {}};
        default:
            return {code: 404, msg: '您访问了并不存在的API！', body: {}};      
    }
}

module.exports = rule;