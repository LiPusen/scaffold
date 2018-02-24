const orm = require('orm');
// 格式化时间
const moment = require('moment');
// 卡券使用规则表card_day
const table = {
    // 卡券唯一标识， 主键
    'card_id': {type: 'text', key: true},
    // 店铺ID
    'shop_id': Number,
    // 卡券类型
    'card_type': {type: 'enum', values: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']},
    // 卡券生效开始日期
    'start_day': {type: 'date', time: false},
    // 卡券生效截止日期
    'end_day': {type: 'date', time: false},
    // 领取后多久生效
    'after_day': {type: 'integer'},
    // 有效天数
    'validity_day': {type: 'integer'},
    // 生效时间段
    'time': {type: 'text'},
    // 生效周
    'use_week': {type: 'text'},
    // 删除标志 1删除 0正常
    'is_delete': {type: 'integer', defaultValue: 0},
    // 创建时间
    'create_time': {type: 'date', time: true},
    // 更新时间
    'update_time': {type: 'date', time: true}
};

const ops = {
    id: 'card_id',
    validations: {
        'is_delete': orm.enforce.ranges.number(0, 1, '不明白你要干什么')
    },
    identityCache: false,
    timestamp: true,
    collection: '',
    hooks: {
        beforeCreate(next) {
            next();
        },
        beforeSave(next) {
            next();
        }
    },
    methods: {
        getDay() {
            const collect = {};
            collect.fix = moment(this['start_day']).format('YYYY-MM-DD') + '#' + moment(this['end_day']).format('YYYY-MM-DD') + '#' + (this['use_week'] || 0);
            collect.delay = this['after_day'] + '#' + this['validity_day'] + '#' + (this['use_week'] || 0);
            collect.time = JSON.parse(this['time']);
            return collect;
        }
    }
};

module.exports = {
    table,
    ops
}