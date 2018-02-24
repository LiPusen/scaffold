var express = require('express');
var router = express.Router();
var rule = require("./rule");
var until = require('os-tool');
var orm = require('orm');
var moment = require('moment');
var md = require('../middleware');

// 获得店铺内所有自领的卡券列表
router.post('/getShopList', (req, res, next) => {
    // @req {shopId, current, offset}
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    const final = { page: {current: req.body.current, offset: req.body.offset}, rows: [] };
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.settings.set("pagination.perpage", req.body.offset);
    req.models.card.count({'shop_id': req.body.shopId, 'is_delete': 0, 'shelf_status': 1, 'issue_way': 1},(er1, rows) => {
        if(er1) console.log(until.ormErr(er1)) ;
        final.page.rows = rows;
        final.page.pages = Math.ceil(rows/req.body.offset);
        final.rows = [];
        req.models.card.page(req.body.current).find({'shop_id': req.body.shopId, 'is_delete': 0, 'shelf_status': 1, 'issue_way': 1}).order('-spec_order').run((er2, list) => {
            if(er2) console.log(until.ormErr(er2)) ;
            if(list.length) {
                list.forEach((k, i) => {
                    if((k['validity_type'] == '1' && new Date(k['times']['end_day']).getTime() >= new Date().getTime()) || k['validity_type'] != '1') {
                        const b = k.getList();
                        b['cardId'] = k['card_id'];
                        b.useType == '1' && (b.useDate = k.times.getDay().fix);
                        b.useType == '2' && (b.useDate = k.times.getDay().delay);
                        b.time = b.periodType == '2' ? k.times.getDay().time : [];
                        final.rows.push(b);
                    } else {
                        k['shelf_status'] = 0;
                        k['info_desc'] = '卡券' + k['card_name'] + '已过期，被系统主动下架！';
                        k.save(e => {
                            if(e) console.log(until.ormErr(e))
                        })
                    }
                })
            } else {}
            res.json(rule(200, final));
        })
    })
    
})
// 领取卡券
router.post('/obtain', (req, res, next) => {
    // @req {userId, shopId, cardId}
    // 获取已领卡券数量
    req.models.myCard.countAsync({'card_id': req.body.cardId, 'user_id': req.body.userId}).then(m => {
        req.final = {m};
        next();
    }, e => {
        res.json(rule(301, {info: '卡券异常！'}))
    })
}, (req, res, next) => {
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.getAsync(req.body.cardId).then(s => {
        // 判断库存
        if(s['stock'] <= 0) {
            res.json(rule(200, {info: '卡券已被抢空哦！', over: 0}))
        } else if(s['quota'] <= req.final.m) {
            res.json(rule(200, {info: '该卡券领取已达上限！', over: 0}))
        } else if(s['validity_type'] == '1' && new Date(s['times']['end_day']).getTime() < new Date().getTime()) {
            res.json(rule(200, {info: '您来晚了,该卡券已失效！', over: 0}))
        } else {
            const c = {};
            // 生成卡券唯一标识 XXX-XXX-XXXX
            c['my_id'] = until.uuid(3, 36) + '-' + until.uuid(3, 36) + '-' + until.uuid(4, 36);
            const share = ['card_id', 'card_name', 'card_type', 'orginal_price', 'price', 'discount_rate', 'is_share', 'item_suitable', 'cost', 'notice', 'issue_way', 'shop_id'];
            for(let i = 0; i < share.length; i++) {
                c[share[i]] = s[share[i]];
            }
            // 计算生效日期
            if(s['validity_type'] == '1') {
                c['effective'] = s['times']['start_day'];
                c['failure'] = s['times']['end_day'];
            } else {
                c['effective'] = moment(new Date().getTime() + (s['times']['after_day'] * (24*60*60*1000))).format('YYYY-MM-DD HH:mm:ss');
                c['failure'] = moment(new Date().getTime() + ((s['times']['after_day'] + s['times']['validity_day']) * (24*60*60*1000))).format('YYYY-MM-DD HH:mm:ss');
            }
            // 计算可用时间段
            if(s['period_type'] == '1') {
                c['time'] = '[]';
                c['use_week'] = '0';
            } else {
                c['time'] = s['times']['time'];
                c['use_week'] = s['times']['use_week'];
            }
            c['user_id'] = req.body.userId;
            req.c = c;
            next(); 
        }
    }, e => {
        res.json(rule(301, {info: '卡券不存在'}));
    })
}, md.getCTel, (req, res, next) => {
    req.models.myCard.create(req.c, (er, ss) => {
        if(er) console.log(until.ormErr(er));
        req.models.card.getAsync(req.c['card_id']).then(s => {
            s['stock'] = Number(s['stock']) -1;
            if(s['stock'] <= 0) {
                s['shelf_status'] = 0;
                s['info_desc'] = '卡券' + s['card_name'] + '库存耗尽，被系统主动下架！';
            }
            const over = s['stock'] >= s['quota'] ? (Number(s['quota']) - req.final.m - 1) : (Number(s['stock']) - req.final.m - 1)
            s.save(err => {
                res.json(rule(200, {info: '领取成功！', over}))
            })
        })
    })
})
// 消费后自动领取卡券
router.post('/handsel', (req, res, next) => {
    // @req {cash, userId, shopId, orderId}
    // 根据orderId查找是否已领过卡券，如果领过就返回，没有就领取
    if(req.body.orderId) {
        req.models.myCard.find({'shop_id': req.body.shopId, 'user_id': req.body.userId, 'order_id': req.body.orderId}, (e, s) => {
            if(e) {
                console.log(e)
            } else {
                if(s.length){
                    s.forEach((ss, i) => {
                        s[i] = ss.getList();
                    })
                    res.json(rule(200, s));
                } else { next();}
            }
        })
    } else {
        next()
    }
},(req, res, next) => {
    // @req {cash, userId, shopId, orderId}
    // 查找有效可用的卡券
    req.body.cash = Number(req.body.cash) || 0;
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.find({'shop_id': req.body.shopId, 'is_delete': 0, 'shelf_status': 1, 'issue_way': 2}, (err, s) => {
        if(err) {
            console.log(until.ormErr(err))
        } else {
            req.c = {};
            req.c['one'] = s.filter(k => ((k['validity_type'] == '1' && new Date(k['times']['end_day']).getTime() >= new Date().getTime()) || k['validity_type'] != '1') && k['cost'] <= req.body.cash);
            next();
        }
    })
}, (req, res, next) => {
    const two = [];
    let count = 0;
    req.c['user_id'] = req.body.userId;
    const fun = ct => {
        const item = req.c['one'][ct];
        req.models.myCard.countAsync({'card_id': item['card_id'], 'user_id': req.body.userId}).then(m => {
            if(item['stock'] > 0 && item['quota'] > m) {
                const t = {};
                t['my_id'] = until.uuid(3, 36) + '-' + until.uuid(3, 36) + '-' + until.uuid(4, 36);
                const share = ['card_id', 'card_name', 'card_type', 'orginal_price', 'price', 'discount_rate', 'is_share', 'item_suitable', 'cost', 'notice', 'issue_way', 'shop_id'];
                for(let i = 0; i < share.length; i++) {
                    t[share[i]] = item[share[i]];
                }
                // 计算生效日期
                if(item['validity_type'] == '1') {
                    t['effective'] = item['times']['start_day'];
                    t['failure'] = item['times']['end_day'];
                } else {
                    t['effective'] = moment(new Date().getTime() + (item['times']['after_day'] * (24*60*60*1000))).format('YYYY-MM-DD HH:mm:ss');
                    t['failure'] = moment(new Date().getTime() + ((item['times']['after_day'] + item['times']['validity_day']) * (24*60*60*1000))).format('YYYY-MM-DD HH:mm:ss');
                }
                // 计算可用时间段
                if(item['period_type'] == '1') {
                    t['time'] = '[]';
                    t['use_week'] = '0';
                } else {
                    t['time'] = item['times']['time'];
                    t['use_week'] = item['times']['use_week'];
                }
                t['user_id'] = req.body.userId;
                two.push(t);
                count = ct + 1;
                if(count == req.c['one'].length) {
                    req.c['two'] = two;
                    item['stock'] = Number(item['stock']) -1;
                    item['stock'] <= 0 && (item['info_desc'] = '卡券' + item['card_name'] + '库存耗尽，被系统主动下架！');
                    item['stock'] <= 0 && (item['shelf_status'] = 0);
                    item.save(err => {
                        next();
                    })
                } else {
                    item['stock'] = Number(item['stock']) -1;
                    item['stock'] <= 0 && (item['info_desc'] = '卡券' + item['card_name'] + '库存耗尽，被系统主动下架！');
                    item['stock'] <= 0 && (item['shelf_status'] = 0);
                    item.save(err => {
                        return fun(count);
                    })
                }
            } else { 
                count = ct + 1;
                if(count == req.c['one'].length) {
                    req.c['two'] = two;
                    next();
                } else {
                    return fun(count);
                }
            };
        })
    }
    if(req.c['one'].length) {fun(0)} else {req.c['two'] = [];;next();};
}, md.getCTel, (req, res, next) => {
    req.c['two'].forEach(item => {
        item['tel'] = req.c['tel'];
        item['order_id'] = req.body.orderId;
    });
    req.models.myCard.create(req.c['two'], (er, ss) => {
        if(er) {
            res.json(rule(301, {info: '领取失败！'}));
        } else {
            ss.forEach((sss, i) => {
                ss[i] = sss.getList();
            })
            res.json(rule(200, ss));
        }
    })
})
// 我的卡券中心
router.post('/myList', (req, res, next) => {
    // @req {current, offset, lose, issueWay, userId}
    let mm = {};
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    Number(req.body.lose) ? (mm['or'] = [{'is_use': [1, 2]}, {'lose': 1}]) : (mm = {'lose': 0, 'is_use': 0});
    req.body.issueWay && (mm['issue_way'] = req.body.issueWay);
    const final = { page: {current: req.body.current, offset: req.body.offset}, rows: [] };
    req.models.myCard.settings.set("pagination.perpage", req.body.offset);
    req.models.myCard.count({'user_id': req.body.userId, ...mm}, (err, rows) => {
        if(err) {
            res.json(rule(301, {info: '我的卡券服务器撒娇了，赶紧找人处理吧！'}))
        } else {
            final.page.rows = rows;
            final.page.pages = Math.ceil(rows/req.body.offset);
            final.rows = [];
            if(req.body.count){
                res.json(rule(200, {count: rows}))
            } else {
                req.models.myCard.page(req.body.current).find({'user_id': req.body.userId, ...mm}).order('-update_time').run((er, list) => {
                    if(er) console.log(until.ormErr(er))
                    final.rows = list || [];
                    req.c = final;
                    if(req.c['rows'] && req.c['rows'].length) {
                        next();
                    } else {
                        res.json(rule(200, final))
                    }
                })
            }
        }
    })
}, md.getShopInfo, (req, res, next) => {
    res.json(rule(200, req.c))
})
// 选择可以使用的卡券
router.post('/pick', (req, res, next) => {
    // @req {cash, userId, shopId}
    const mm = {'is_delete': 0, 'lose': 0, 'is_use': 0};
    mm['cost'] = orm.lte(Number(req.body.cash) || 0);
    mm['failure'] = orm.gte(new Date());
    req.models.myCard.find({'shop_id': req.body.shopId, 'user_id': req.body.userId, ...mm}, (err, list) => {
        if(err) {
            res.json(rule(301, until.ormErr(err)));
        } else {
            const final = [];
            let wn = new Date().getDay();
            const tn = Number(moment().format('HH:mm').replace(':', ''));
            wn = wn == '0' ? 7 : wn;
            if(list.length) {
                list.forEach(item => {
                    const isW = item['use_week'] == '0' || item['use_week'].indexOf(wn) >= 0;
                    let isT = false;
                    let t = JSON.parse(item['time']);
                    if(t.length) {
                        t.forEach(tm => {
                            const tt = tm.split('#');
                            const tt0 = Number(tt[0].replace(':', ''));
                            const tt1 = Number(tt[1].replace(':', ''));
                            tt0 <= tn && tt1 >= tn && (isT = true);
                        })
                    } else {
                        isT = true;
                    }
                    if(isW && isT) {
                        final.push(item.getList());
                    } else {}
                })
            }
            res.json(rule(200, {list: final}));
        }
    }) 
})
// 卡券线上核销
router.post('/use', (req, res, next) => {
    // @req {userId, cardno}
    req.models.myCard.get(req.body.cardno, (err, s) => {
        if(err) {
            console.log(err)
        // } else if(s['user_id'] != req.body.userId) {
        //     res.json(rule(301, {info: '您不能用别人的卡券核销自己的账单哦！'}))
        } else if(Number(s['is_use']) != 0){
            res.json(rule(301, {info: '该卡券已核销不能重复核销！'}))
        } else {
            s['is_use'] = 1;
            s.save(e => {
                if(e) {console.log(e)} else {res.json(rule(200, {info: '核销成功！'}))}
            })
        }
    })
})
// 获取卡券信息
router.post('/getCardInfo', (req, res, next) => {
    // @req {cardId} isNot: 1 过期无法领取 2 库存不足无法领取
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.get(req.body.cardId, (err, s) => {
        if(err) {
            res.json(rule(301, {info: '没有这张卡券哦！'}))
        } else {
            if((s['validity_type'] == '1' && new Date(s['times']['end_day']).getTime() >= new Date().getTime()) || s['validity_type'] != '1') {
                s['stock'] <= 0 ? (s.isNot = 2) : (s.isNot = 0);
            } else {
                s.isNot = 1;
            }
            req.c = s;
            next();
        }
    })
}, md.getShop, (req, res, next) => {
    res.json(rule(200, req.c));
})
// 微服务查询卡券详情！
router.use('/getCard', (req, res, next) => {
    req.body = JSON.stringify(req.query) == '{}' ? req.body : JSON.parse(JSON.stringify(req.query));
    req.models.myCard.get(req.body.cardno, (err, s) => {
        if(err) {
            res.json(rule(301, {info: '没有这张卡券哦！'}))
        } else {
            const f = s.getList();
            f.shopId = s['shop_id'];
            res.json(rule(200, f))
        }
    })
})
// 微服务查询店铺卡券数据
router.use('/shopCard', (req, res, next) => {
    req.body = JSON.stringify(req.query) == '{}' ? req.body : JSON.parse(JSON.stringify(req.query));
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.get(req.body.cardId, (err, s) => {
        if(err) {
            res.json(rule(301, {info: '店铺卡券不存在！'}))
        } else {
            const f = s.getList();
            f['cardId'] = s['card_id'];
            f.useType == '1' && (f.useDate = s.times.getDay().fix);
            f.useType == '2' && (f.useDate = s.times.getDay().delay);
            f.time = f.periodType == '2' ? s.times.getDay().time : [];
            res.json(rule(200, f))
        }
    })
})

module.exports = router;