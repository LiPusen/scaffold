const orm = require('orm');
const trans = require('./trans');
// card_chart表设计
const table = {
    // 卡券唯一标识， 主键
    'card_id': {type: 'text', key: true},
    // 店铺ID
    'shop_id': Number,
    // 卡券类型
    'card_type': {type: 'enum', values: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']},
    // 卡券名称
    'card_name': {type: 'text', size: 50},
    //  销售数量
    'sales': {type: 'integer'},
    //  销售金额
    'csales': {type: 'number'},
    //  自领数量
    'selfs': {type: 'integer'},
    // 消费后自动发放数量
    'afters': {type: 'integer'},
    // 线上使用数量
    'onlines': {type: 'integer'},
    // 线下使用数量
    'offlines': {type: 'integer'},
    // 过期数量
    'expires': {type: 'integer'},
    // 删除标志 1删除 0正常
    'is_delete': {type: 'integer', defaultValue: 0},
    // 创建时间
    'create_time': {type: 'date', time: true},
    // 更新时间
    'update_time': {type: 'date', time: true}    
}

const ops = {
    id: 'card_id',
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
            for(let k in trans.chartc) {
                collect[trans.chartc[k]] = this[k];
            }
            return collect;
        }
    }
}

module.exports = {
    table,
    ops
}