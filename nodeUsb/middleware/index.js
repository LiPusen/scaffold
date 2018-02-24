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
// 获取C端用户联系方式
const getCTel = (req, res, next) => {
    xhr.post(cof.bsUr.getCTel, "userId=" + req.c['user_id'], { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } }).then(data => {
        if(data.data.body.length) {
            req.c['tel'] = data.data.body[0].contact;
            next();
        } else {
            res.json({code: 301, msg: '非法的用户！'});
        }
    }, e => {
        console.log(e)
        res.json({code: 301, msg: '非法的用户！'});
    })
}
// 根据店铺ID获取店铺相关信息
const getShopInfo = (req, res, next) => {
    let n = 0;
    const info = (n) => {
        xhr.post(cof.bsUr.getShopInfo, "shopId=" + req.c['rows'][n]["shop_id"], { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' } }).then(data => {
            if(data.data.header.statusCode == '1' && data.data.body.info) {
                req.c['rows'][n] = req.c['rows'][n].getList();
                req.c['rows'][n]['shopName'] = data.data.body.info.shopName;
                req.c['rows'][n]['shopType'] = data.data.body.info.cateringType;
                req.c['rows'][n]['shopAddr'] = data.data.body.info.detailAddress;
                n = n + 1;
                if (n == req.c['rows'].length) {next()} else {return info(n)};
            } else {
                res.json({code: 301, msg: '后台小哥罢工了哦！'})
            }
        }, e => {
            console.log(e)
            res.json({code: 301, msg: '服务器异常！'})
        })
    }
    info(0);
}
// 根据店铺ID获取单个店铺详情
const getShop = (req, res, next) => {
    xhr.post(cof.bsUr.getShopInfo, "shopId=" + req.c['shop_id'], {headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }}).then(data => {
        if(data.data.header.statusCode == '1' && data.data.body.info) {
            const f = req.c.getList();
            f.cardId = req.c['card_id'];
            f.shopId = req.c['shop_id'];
            f.isNot = req.c['isNot'];
            f.useType == '1' && (f.useDate = req.c.times.getDay().fix);
            f.useType == '2' && (f.useDate = req.c.times.getDay().delay);
            f.time = f.periodType == '2' ? req.c.times.getDay().time : [];
            f.shopName = data.data.body.info.shopName;
            f.shopType = data.data.body.info.cateringType;
            f.shopAddr = data.data.body.info.detailAddress;
            req.c = JSON.parse(JSON.stringify(f));
            next();
        } else {
            res.json({code: 301, msg: '后台小哥罢工了哦！'})
        }
    }, e => {
        console.log(e)
        res.json({code: 301, msg: '服务器异常！'})
    })
}
module.exports = {
    ...require('./check'),
    bCheckUser,
    getCTel,
    getShopInfo,
    getShop
}