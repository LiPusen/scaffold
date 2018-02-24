const orm = require('orm');
const moment = require('moment');
const trans = require('./trans');
// card_my表设计
const table = {
    // 用户领取卡券后的唯一编码
    'my_id': {type: 'text', key: true},
    // 卡券ID
    'card_id': {type: 'text', required: true},
    // 卡券名称
    'card_name': {type: 'text'},
    // 卡券类型
    'card_type': {type: 'enum', values: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']},
    // 卡券原价、面额、等价物
    'orginal_price': {type: 'number'},
    // 售卖价
    'price': {type: 'number'},
    // 折扣率，保留一位小数
    'discount_rate': {type: 'number'},
    // 是否与其他优惠共享1 否则0
    'is_share': {type: 'integer'},
    // 适用商品描述
    'item_suitable': {type: 'text'},
    // 最低消费金额，使用条件
    'cost': {type: 'number'},
    // 使用须知，其他
    'notice': {type: 'text', size: 500},
    // 领取方式 1自领 2消费后领取
    'issue_way': {type: 'enum', values: ['1', '2', '3']},
    // 生效日期
    'effective': {type: 'date'},
    // 失效日期
    'failure': {type: 'date'},
    // 可用时间段
    'time': {type: 'text'},
    // 可用周
    'use_week': {type: 'text'},
    // 店铺ID
    'shop_id': {type: 'number'},
    // 用户ID
    'user_id': {type: 'number'},
    // 用户手机号码
    'tel': {type: 'text'},
    // 是否使用(核销)0未核销 1线上核销 2线下核销
    'is_use': {type: 'integer', defaultValue: 0},
    // 核销人
    'use': {type: 'text'},
    // 是否失效标识1已失效0未失效
    'lose': {type: 'integer', defaultValue: 0},
    // 订单编号
    'order_id': {type: 'text'},
    // 删除标志 1删除 0正常
    'is_delete': {type: 'integer', defaultValue: 0},
    // 信息描述
    'info_desc': {type: 'text'},
    // 创建时间
    'create_time': {type: 'date', time: true},
    // 更新时间
    'update_time': {type: 'date', time: true}
}

const ops = {
    id: 'my_id',
    validations: {
    },
    identityCache: false,
    timestamp: true,
    collection: '',
    hooks: {
        beforeCreate(next) {
            next();
        }
    },
    methods: {
        getList() {
            const collect = {};
            for(let k in trans.cmy) {
                collect[trans.cmy[k]] = this[k];
            }
            collect['time'] = JSON.parse(collect['time']);
            collect['effective'] = moment(collect['effective']).format('YYYY-MM-DD'); 
            collect['failure'] = moment(collect['failure']).format('YYYY-MM-DD'); 
            return collect;
        },
        getUse() {
            const collect = {};
            collect['useTime'] = moment(this['update_time']).format('YYYY-MM-DD HH:mm:ss');
            collect['cardno'] = this['my_id'];
            collect['cardName'] = this['card_name'];
            collect['way'] = this['is_use'];
            collect['useName'] = this['use'];
            collect['tel'] = this['tel'];
            return collect;
        }
    }
}

module.exports = {
    table,
    ops
}