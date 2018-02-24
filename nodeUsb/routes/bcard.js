var express = require('express');
var router = express.Router();
var rule = require("./rule");
var until = require('os-tool');
var _ = require('lodash');
var orm = require('orm');
var moment = require('moment');
// 导出Excel
var excel = require('excel-export').execute;
// 调试用假数据
var mock = require('./mock');
// 字段重命名
var trans = require('../orm/trans');
// 中间件
var mid = require('../middleware');

// 获取卡券列表
router.post('/getList', (req, res, next) => {
    // @req {shopId, current, offset, cardName, cardType, shelfSta}
    const mm = {};
    req.body.cardName && (mm['card_name'] = orm.like('%' + req.body.cardName + '%'));
    req.body.cardType && (mm['card_type'] = req.body.cardType);
    (req.body.shelfSta || req.body.shelfSta === 0) && (mm['shelf_status'] = req.body.shelfSta);
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    const final = { page: {current: req.body.current, offset: req.body.offset}, rows: [] };
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.settings.set("pagination.perpage", req.body.offset);
    req.models.card.count({'shop_id': req.body.shopId, 'is_delete': 0, ...mm}, (er1, rows) => {
        if(er1) console.log(until.ormErr(er1)) ;
        final.page.rows = rows;
        final.page.pages = Math.ceil(rows/req.body.offset);
        final.rows = [];
        req.models.card.page(req.body.current).find({'shop_id': req.body.shopId, 'is_delete': 0, ...mm}).order('-spec_order').run((er2, list) => {
            if(er2) console.log(until.ormErr(er2)) ;
            if(list.length) {
                const p = [];
                list.forEach((k, i) => {
                    list[i] = k.getList()
                    list[i]['cardId'] = k['card_id'];
                    list[i].useType == '1' && (list[i].useDate = k.times.getDay().fix);
                    list[i].useType == '2' && (list[i].useDate = k.times.getDay().delay);
                    list[i].time = list[i].periodType == '2' ? k.times.getDay().time : [];
                })
                final.rows = JSON.parse(JSON.stringify(list));
            } else { }
            res.json(rule(200, final));
        })
    })
})
// 删除卡券
router.post('/del', (req, res, next) => {
    // @req {cardId, shopId}
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.one({'card_id': req.body.cardId, 'shop_id': req.body.shopId}, (err, card) => {
        if(err || _.isEmpty(card)) {
            res.json(rule(301, until.ormErr(err)))
        } else {
            card['is_delete'] = 1;
            card.times['is_delete'] = 1;
            card.save(er0 => {
                er0 && console.log(until.ormErr(er0))
                card.times.save(er1 => {
                    er1 && console.log(until.ormErr(er1))
                    next();
                })
            })
        }
    })
}, (req, res, next) => {
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.find({'shop_id': req.body.shopId, 'is_delete': 0, 'shelf_status': 1, 'issue_way': 1}).order('-spec_order').run((err, list) => {
        if(err) console.log(until.ormErr(err))
        const a = [];
        if(list.length) {
            list.forEach((k, i) => {
                if((k['validity_type'] == '1' && new Date(k['times']['end_day']).getTime() >= new Date().getTime()) || k['validity_type'] != '1') {
                    const b = k.getList();
                    b['cardId'] = k['card_id'];
                    b.useType == '1' && (b.useDate = k.times.getDay().fix);
                    b.useType == '2' && (b.useDate = k.times.getDay().delay);
                    b.time = b.periodType == '2' ? k.times.getDay().time : [];
                    a.push(b);
                } else {
                    k['shelf_status'] = 0;
                    k['info_desc'] = '卡券' + k['card_name'] + '已过期，被系统主动下架！';
                    k.save(e => {
                        if(e) console.log(e)
                    })
                }
            })
        }
        req.models.shop.get(req.body.shopId, (er, item) => {
            item['card_counter'] = a.length;
            item['card_content_json'] = JSON.stringify(a);
            item.save(e => {
                if(e) console.log(e)
                res.json(rule(200, {info: '卡券删除成功！'}));
            })
        })
    })   
});
// 添加或更新卡券
router.post('/addOrUpdate', mid.addCard, (req, res, next) => {
    // @req in mock
    const got = req.body;
    let final = {times: {}};
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    if(_.trim(got.cardId)) {
        req.models.card.get(_.trim(got.cardId), (er0, one) => {
            if(er0) {
                res.json(rule(301, until.ormErr(er0)));
            } else {
                for(let k in trans.card) {
                    one[k] = got[trans.card[k]];
                }
                for(let d in trans.cday(got)) {
                    one['times'][d] = trans.cday(got)[d];
                }
                one['info_desc'] = '';
                one.save(cr => {
                    if(cr) {
                        res.json(rule(301, until.ormErr(cr)));
                    } else {
                        next();   
                    }
                })
            }   
        })
    } else {
        let uuid = 'kq' + until.uuid(8, 32);
        for(let k in trans.card) {
            final[k] = got[trans.card[k]];
        }
        final['shop_id'] = got.shopId;
        final['card_id'] = uuid;
        final['times'] = trans.cday(got);
        final['times']['shop_id'] = got.shopId;
        final['times']['card_id'] = uuid;
        uuid = null;
        req.models.card.aggregate({'shop_id': got.shopId}).max('spec_order').get((ar, max) => {
            if(ar) {
                console.log(ar)
                res.json(rule(301, until.ormErr(ar)))
            } else {
                final['spec_order'] = Number(max) + 1;
                req.models.card.create(final, (err, card) => {
                    // console.log(card)
                   next();  
                })
            }
        })   
    } 
}, (req, res, next) => {
    req.models.card.hasOne('times', req.models.cardDay, {field: 'card_id', autoFetch:true});
    req.models.card.find({'shop_id': req.body.shopId, 'is_delete': 0, 'shelf_status': 1, 'issue_way': 1}).order('-spec_order').run((err, list) => {
        if(err) console.log(until.ormErr(err));
        const a = [];
        if(list.length) {
            list.forEach((k, i) => {
                if((k['validity_type'] == '1' && new Date(k['times']['end_day']).getTime() >= new Date().getTime()) || k['validity_type'] != '1') {
                    const b = k.getList();
                    b['cardId'] = k['card_id'];
                    b.useType == '1' && (b.useDate = k.times.getDay().fix);
                    b.useType == '2' && (b.useDate = k.times.getDay().delay);
                    b.time = b.periodType == '2' ? k.times.getDay().time : [];
                    a.push(b);
                } else {
                    k['shelf_status'] = 0;
                    k['info_desc'] = '卡券' + k['card_name'] + '已过期，被系统主动下架！';
                    k.save(e => {
                        if(e) console.log(e)
                    })
                }
            })
        }
        req.models.shop.get(req.body.shopId, (er, item) => {
            item['card_counter'] = a.length;
            item['card_content_json'] = JSON.stringify(a);
            item.save(e => {
                if(e) console.log(e)
                res.json(rule(200, {info: _.trim(req.body.cardId) ? '卡券更新成功！' : '卡券添加成功！'}));
            })
        })
    })   
})
// 排序
router.post('/sort', (req, res, next) => {
    // @req {cardId, sort, shopId} sort: 'UP' | 'DOWN';
    const got = req.body;
    console.log(got)
    req.models.card.find({'shop_id': got.shopId, 'is_delete': 0}, {order: '-spec_order'}, (ar, ls) => {
        if(ar || !ls.length) {
            console.log(ar)
            res.json(rule(301, until.ormErr(ar)))
        } else {
            let u = false;
            ls.forEach((item, i) => {
                if(item['card_id'] == got.cardId) {
                    u = true;
                    if(got.sort == 'UP') {
                        if(i == 0) {
                            res.json(rule(301, {info: '这是第一张卡券哦，无法上移！'})); 
                        } else {
                            let m = item['spec_order'];
                            item['spec_order'] = ls[i-1]['spec_order'];
                            item.save(ur => {
                                ls[i-1]['spec_order'] = m;
                                ls[i-1].save(r => {
                                    res.json(rule(200, {info: '上移操作成功！'})); 
                                })
                            })
                        }
                    } else {
                        if(i == (ls.length - 1)) {
                            res.json(rule(301, {info: '我已经排在最后了，无法下移！'}));
                        } else {
                            let m = item['spec_order'];
                            item['spec_order'] = ls[i+1]['spec_order'];
                            item.save(ur => {
                                ls[i+1]['spec_order'] = m;
                                ls[i+1].save(r => {
                                    res.json(rule(200, {info: '上移操作成功！'})); 
                                })
                            })
                        }
                    }
                } else {}
            });
            !u && res.json(rule(301, {info: '该卡券已经被移除！'}));
        }
    })   
})
// 卡券统计报表TODO
router.use('/total', (req, res, next) => {
    // @req {start, end, cardType, current, offset, shopId}
    const mm = {}, dreg = /^(2[0-9]{3})-(0[1-9]|10|11|12)-(30|31|[0-2][0-9])$/;
    req.body = _.isEmpty(req.query) ? req.body : JSON.parse(JSON.stringify(req.query));
    req.body.start = dreg.test(req.body.start) ? req.body.start + ' 00:00:00' : '2000-01-01';
    req.body.end = dreg.test(req.body.end) ? req.body.end + ' 23:59:59' : '2999-12-31';
    req.body.cardType && (mm['card_type'] = req.body.cardType);
    mm['update_time'] = orm.between(req.body.start, req.body.end);
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    const final = { page: {current: req.body.current, offset: req.body.offset}, total: {self: '', sale: '', online: '', offline: ''}, rows: [] };
    req.models.card.settings.set("pagination.perpage", req.body.offset);
    // 卡券字典
    const ctype = {'Q1': '折扣券', 'Q2': '优惠券', 'Q3': '礼品券'};
    req.models.card.count({'shop_id': req.body.shopId, ...mm}, (err, rows) => {
        if(err) {
            console.log(until.ormErr(err));
        } else {
            final.page.rows = rows;
            final.page.pages = Math.ceil(rows/req.body.offset);
            req.models.myCard.count({'shop_id': req.body.shopId, 'is_use': 1, ...mm}, (onr, on) => final.total.online = on)
                             .count({'shop_id': req.body.shopId, 'is_use': 2, ...mm}, (offr, off) => final.total.offline = off)
                             .count({'shop_id': req.body.shopId, 'issue_way': 1, ...mm}, (sfr, sf) => final.total.self = sf)
                             .count({'shop_id': req.body.shopId, 'issue_way': 2, ...mm}, (slr, sl) => {
                                 final.total.sale = sl
                                 if(req.method == 'POST') {
                                    req.models.card.page(req.body.current).find({'shop_id': req.body.shopId, ...mm}).only("card_id", "card_name", "card_type").order('-spec_order').run((er, cls) => {
                                        let n = 0;
                                        const ns = i => {
                                            final.rows[i] = {};
                                            final.rows[i]['cardName'] = cls[i]['card_name'];
                                            final.rows[i]['cardType'] = cls[i]['card_type'];
                                            req.models.myCard.count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'is_use': 1, ...mm}, (onr, on) => final.rows[i].online = on)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'is_use': 2, ...mm}, (offr, off) => final.rows[i].offline = off)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'issue_way': 1, ...mm}, (sfr, sf) => final.rows[i].self = sf)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'issue_way': 2, ...mm}, (slr, sl) => final.rows[i].sale = sl)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'lose': 1, ...mm}, (lor, lo) => {
                                                                    final.rows[i].lose = lo;
                                                                    n = n + 1;
                                                                    if(n == cls.length) {
                                                                        res.json(rule(200, final))
                                                                    } else {
                                                                        return ns(n);
                                                                    }
                                                             })
                                        }
                                        if(cls.length) {
                                            ns(0);
                                        } else {
                                            res.json(rule(200, final))
                                        }
                                    }) 
                                } else {
                                    const cs = [{caption: '卡券名称', type: 'string', width: 25}, {caption: '卡券类型', type: 'string', width: 25}, {caption: '自领张数', type: 'number', width: 25}, {caption: '消费发放张数', type: 'number', width: 25}, {caption: '线上使用张数', type: 'number', width: 25}, {caption: '到店核销张数', type: 'number', width: 25}, {caption: '过期张数', type: 'number', width: 25}];
                                    const rs = [];
                                    req.models.card.find({'shop_id': req.body.shopId, ...mm}).only("card_id", "card_name", "card_type").order('-spec_order').run((er, cls) => {
                                        let n = 0;
                                        const ns = i => {
                                            rs[i] = [];
                                            rs[i][0] = cls[i]['card_name'];
                                            rs[i][1] = ctype[cls[i]['card_type']];
                                            req.models.myCard.count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'is_use': 1, ...mm}, (onr, on) => rs[i][4] = on)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'is_use': 2, ...mm}, (offr, off) => rs[i][5] = off)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'issue_way': 1, ...mm}, (sfr, sf) => rs[i][2] = sf)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'issue_way': 2, ...mm}, (slr, sl) => rs[i][3] = sl)
                                                             .count({'shop_id': req.body.shopId, 'card_id': cls[i]['card_id'], 'lose': 1, ...mm}, (lor, lo) => {
                                                                    rs[i][6] = lo;
                                                                    n = n + 1;
                                                                    if(n == cls.length) {
                                                                        rs[n] = [];
                                                                        rs[n][0] = '总计：';
                                                                        rs[n][1] = '';
                                                                        rs[n][2] = final.total.self;
                                                                        rs[n][3] = final.total.sale;
                                                                        rs[n][4] = final.total.online;
                                                                        rs[n][5] = final.total.offline;
                                                                        rs[n][6] = '';
                                                                        res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
                                                                        res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent("卡券明细报表" + moment(new Date()).format('YYYYMMDD'))+".xlsx");
                                                                        res.end(excel({cols: cs, rows: rs}), 'binary')
                                                                    } else {
                                                                        return ns(n);
                                                                    }
                                                             })
                                        }
                                        if(cls.length) {
                                            ns(0);
                                        } else {
                                            res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
                                            res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent("卡券明细报表" + moment(new Date()).format('YYYYMMDD'))+".xlsx");
                                            res.end(excel({cols: cs, rows: rs}), 'binary')
                                        }
                                    }) 
                                }
                            });           
        }
    })
})
// 卡券细分统计报表
router.use('/chartDetail', (req, res, next) => {
    // @req {start, end, cardType, current, offset, shopId, type[self, sale, online, offline]}
    const mm = {}, dreg = /^(2[0-9]{3})-(0[1-9]|10|11|12)-(30|31|[0-2][0-9])$/;
    req.body = _.isEmpty(req.query) ? req.body : JSON.parse(JSON.stringify(req.query));
    req.body.start = dreg.test(req.body.start) ? req.body.start + ' 00:00:00' : '2000-01-01';
    req.body.end = dreg.test(req.body.end) ? req.body.end + ' 23:59:59' : '2999-12-31';
    req.body.cardType && (mm['card_type'] = req.body.cardType);
    mm['update_time'] = orm.between(req.body.start, req.body.end);
    switch (req.body.type) {
        case 'self':
            mm['issue_way'] = 1;
            break;
        case 'sale':
            mm['issue_way'] = 2;
            break;
        case 'online':
            mm['is_use'] = 1;
            break;
        case 'offline':
            mm['is_use'] = 2;
            break;  
        default:
            break;
    }
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    const final = { page: {current: req.body.current, offset: req.body.offset}, rows: [] };
    req.models.myCard.settings.set("pagination.perpage", req.body.offset);
    req.models.myCard.count({'shop_id': req.body.shopId, ...mm}, (err, rows) => {
        if(err) {
            console.log(err)
        } else {
            final.page.rows = rows;
            final.page.pages = Math.ceil(rows/req.body.offset);
            if(req.method == 'POST') {
                req.models.myCard.page(req.body.current).find({'shop_id': req.body.shopId, ...mm}).order('-create_time').run((er, ls) => {
                    ls.forEach(item => {
                        let a = {};
                        a['tel'] = item['tel'];
                        a['cardName'] = item['card_name'];
                        a['cardno'] = item['my_id'];
                        a['use'] = item['use'];
                        a['createTime'] = moment(item['create_time']).format('YYYY-MM-DD HH:mm:ss');
                        a['useTime'] = moment(item['update_time']).format('YYYY-MM-DD HH:mm:ss');
                        final.rows.push(a);
                    })
                    res.json(rule(200, final));
                })
            } else {
                const cs = {
                    'self': [{caption: '顾客手机号', type: 'string', width: 25, write: 'tel'}, {caption: '卡券名称', type: 'string', width: 25, write: 'card_name'}, {caption: '获取时间', type: 'string', width: 25, write: 'create_time'}],
                    'sale': [{caption: '顾客手机号', type: 'string', width: 25, write: 'tel'}, {caption: '卡券名称', type: 'string', width: 25, write: 'card_name'}, {caption: '获取时间', type: 'string', width: 25, write: 'create_time'}],
                    'online': [{caption: '顾客手机号', type: 'string', width: 25, write: 'tel'}, {caption: '卡券号', type: 'string', width: 25, write: 'my_id'}, {caption: '卡券名称', type: 'string', width: 25, write: 'card_name'}, {caption: '使用时间', type: 'string', width: 25, write: 'update_time'}],
                    'offline': [{caption: '顾客手机号', type: 'string', width: 25, write: 'tel'}, {caption: '卡券号', type: 'string', width: 25, write: 'my_id'}, {caption: '卡券名称', type: 'string', width: 25, write: 'card_name'}, {caption: '核销时间', type: 'string', width: 25, write: 'update_time'}, {caption: '核销人', type: 'string', width: 25, write: 'use'}]
                };
                const rs = [];
                req.models.myCard.find({'shop_id': req.body.shopId, ...mm}).order('-create_time').run((er, ls) => {
                    ls.forEach((item, i) => {
                        item['create_time'] = moment(item['create_time']).format('YYYY-MM-DD HH:mm:ss');
                        item['update_time'] = moment(item['update_time']).format('YYYY-MM-DD HH:mm:ss');
                        const m = [];
                        for(let j = 0; j < cs[req.body.type].length; j++){
                            m.push(item[cs[req.body.type][j].write])
                        }
                        rs.push(m)
                    })
                    const json = {'self': '顾客自领', 'sale': '顾客消费后获得', 'online': '顾客线上使用', 'offline': '顾客到店核销'}
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
                    res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent( json[req.body.type] + "卡券报表" + moment(new Date()).format('YYYYMMDD'))+".xlsx");
                    res.end(excel({cols: cs[req.body.type], rows: rs}), 'binary')
                })
            }
        }
    })
})
// 卡券核销
router.post('/useCard', (req, res, next) => {
    // @req {cardno, shopId, type, cash} type: 1查询卡券详情5核销卡券
    req.body.type = req.body.type || '1';
    req.body.cash = Number(req.body.cash) || 0;
    req.models.myCard.oneAsync({'my_id': req.body.cardno, 'shop_id': req.body.shopId}).then(s => {
        let wn = new Date().getDay();
        wn = wn == '0' ? 7 : wn;
        if(!s) {
            res.json(rule(301, {info: '该卡券不存在!'}));
        } else if(s['is_use'] != '0') {
            res.json(rule(301, {info: '卡券已核销!'}));
        } else if(new Date(s['failure']).getTime() <= new Date().getTime()) {
            res.json(rule(301, {info: '该卡券已失效'}));
        } else if(req.body.type == '5') {
            s['is_use'] = 2;
            s.save(er => {
                if(er) console.log(until.ormErr(er))
                res.json(rule(200, {info: '核销成功！'}))
            })
        } else if(s['use_week'] != '0' && s['use_week'].indexOf(wn) < 0) {
            res.json(rule(301, {info: '该卡券今天不可用！请在周' + s['use_week'] + '使用！'}))
        } else if(req.body.cash < s['cost']) {
            res.json(rule(301, {info: '没有达到该卡券的使用条件！消费满' + s['cost'] + '元才可以使用！'}))
        } else {
            res.json(rule(200, s.getList()));
        }
    }, e => {
        res.json(rule(301, {info: '卡券不存在!'}));
    })
})
// 卡券核销报表
router.post('/useCardList', (req, res, next) => {
    // @req {shopId, start, end, cardno, cardName, tel, current, offset}
    const mm = {'is_use': [1, 2]}, dreg = /^(2[0-9]{3})-(0[1-9]|10|11|12)-(30|31|[0-2][0-9])$/;
    req.body.start = dreg.test(req.body.start) ? req.body.start + ' 00:00:00' : '2000-01-01';
    req.body.end = dreg.test(req.body.end) ? req.body.end + ' 23:59:59' : '2999-12-31';
    req.body.cardno && (mm['my_id'] = orm.like('%' + req.body.cardno + '%'));
    req.body.cardName && (mm['card_name'] = orm.like('%' + req.body.cardName + '%'));
    req.body.tel && (mm['tel'] = orm.like('%' + req.body.tel + '%'));
    mm['update_time'] = orm.between(req.body.start, req.body.end);
    req.body.current = Number(req.body.current) || 1;
    req.body.offset = Number(req.body.offset) || 10;
    const final = { page: {current: req.body.current, offset: req.body.offset}, rows: [] };
    req.models.myCard.settings.set("pagination.perpage", req.body.offset);
    req.models.myCard.count({'shop_id': req.body.shopId, ...mm}, (err, rows) => {
        if(err) console.log(until.ormErr(err)) ;
        final.page.rows = rows;
        final.page.pages = Math.ceil(rows/req.body.offset);
        final.rows = [];
        req.models.myCard.page(req.body.current).find({'shop_id': req.body.shopId, ...mm}).order('-update_time').run((e, list) => {
            if(e) console.log(until.ormErr(e)) ;
            if(list.length) {
                list.forEach((k, i) => {
                    list[i] = k.getUse()
                })
                final.rows = JSON.parse(JSON.stringify(list));
            } else { }
            res.json(rule(200, final));
        })
    })
})
// 卡券核销报表导出
router.get('/useCardListD', (req, res, next) => {
    // @req {shopId, start, end, cardno, cardName, tel}
    const mm = {'is_use': [1, 2]}, dreg = /^(2[0-9]{3})-(0[1-9]|10|11|12)-(30|31|[0-2][0-9])$/;
    req.query.start = dreg.test(req.query.start) ? req.query.start + ' 00:00:00' : '2000-01-01';
    req.query.end = dreg.test(req.query.end) ? req.query.end + ' 23:59:59' : '2999-12-31';
    req.query.cardno && (mm['my_id'] = orm.like('%' + req.query.cardno + '%'));
    req.query.cardName && (mm['card_name'] = orm.like('%' + req.query.cardName + '%'));
    req.query.tel && (mm['tel'] = orm.like('%' + req.query.tel + '%'));
    mm['update_time'] = orm.between(req.query.start, req.query.end);
    req.models.myCard.find({'shop_id': req.query.shopId, ...mm}).order('-update_time').run((e, list) => {
        if(e) console.log(until.ormErr(e)) ;
        // excel标题
        const cols = [{caption: '核销时间', type: 'time', width: 25}, {caption: '卡券号', type: 'string', width: 25}, {caption: '卡券名称', type: 'string', width: 25}, {caption: '用户手机号', type: 'string', width: 25}, { caption: '核销员', type: 'string', width: 25}];
        const rows = [];
        if(list.length) {
            list.forEach((k, i) => {
                rows[i] = [];
                rows[i][0] = moment(k['update_time']).format('YYYY-MM-DD HH:mm:ss');
                rows[i][1] = k['my_id'];
                rows[i][2] = k['card_name'];
                rows[i][3] = k['tel'];
                rows[i][4] = k['use'] || '';
            })
        } else { }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');
        res.setHeader("Content-Disposition", "attachment; filename=" +encodeURIComponent("卡券核销报表" + moment(new Date()).format('YYYYMMDD'))+".xlsx");
        res.end(excel({cols, rows}), 'binary')
    })
})

module.exports = router;