var schedule = require('node-schedule');
var orm = require("orm");
// 相关参数
const cof = require('../config');
const myCardTab = require('../orm/myCard')
const cardTab = require('../orm/card')
const cardDayTab = require('../orm/cardDay')
//  *依次代表分钟(0-59)小时(0-23)月内天(1-31)月(1-12)周内天(0-7)0或7代表周日
schedule.scheduleJob('10 3 * * *', function(){
    const card = 'mysql://' + cof.mysql.card.user + ':' + cof.mysql.card.password + '@' + cof.mysql.card.host + '/' + cof.mysql.card.db + '?pool=false';
    orm.connectAsync(card).then(db => {
        // 载入我的卡券模型
        let myCard = db.define('card_my', myCardTab.table, myCardTab.ops);
        // 载入卡券模型
        let card = db.define('card', cardTab.table, cardTab.ops);
        // 载入卡券日期规则
        let cardDay = db.define('card_day', cardDayTab.table, cardDayTab.ops);
        // 我的卡券主动过期
        myCard.find({'lose': 0, 'is_use': 0}, (e, mls) => {
            if(e) {
                console.log(e);
            } else {
                console.log(mls)
                mls.length && mls.forEach(item => {
                    if(new Date(item['failure']).getTime() <= new Date().getTime()) {
                        item['lose'] = 1;
                        item['info_desc'] = '卡券编号' + item['my_id'] +'已过期';
                        item.save(er => {
                            console.log(new Date() + '卡券编号' + item['my_id'] +'定时过期任务完成');
                        })
                    } else {};
                });
            }
            
        })
        // 店铺卡券主动下架
        card.hasOne('times', cardDay, {field: 'card_id', autoFetch:true});
        card.find({'shelf_status': 1}, (e, cls) => {
            if(e) {
                console.log(e)
            } else {
                console.log(cls)
                cls.length && cls.forEach(item => {
                    if(item['validity_type'] == '1' && new Date(item['times']['end_day']).getTime() <= new Date().getTime()) {
                        item['shelf_status'] = 0;
                        item['info_desc'] = '卡券' + item['card_name'] + '已过期，被系统主动下架！';
                    }
                    if(Number(item['stock']) <= 0) {
                        item['shelf_status'] = 0;
                        item['info_desc'] = '卡券' + item['card_name'] + '库存耗尽，被系统主动下架！';
                    }
                    item['info_desc'] && item.save(err => {
                        console.log(err || (new Date() + item['info_desc']))
                    })
                })
            }
        })
    }, err => {
        if(err) console.log('卡券库连接失败！！！')
    })
});