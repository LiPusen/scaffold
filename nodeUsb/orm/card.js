const orm = require('orm');
const trans = require('./trans');
// card表设计
const table = {
    // 卡券唯一标识， 主键
    'card_id': {type: 'text', key: true},
    // 店铺ID
    'shop_id': Number,
    // 卡券类型
    'card_type': {type: 'enum', values: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']},
    // 卡券名称
    'card_name': {type: 'text', size: 50},
    // 面额、原价、等值价等
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
    'cost': {type: 'number', defaultValue: 0},
    // 有效期类型 1固定时间段使用 2延迟使用
    'validity_type': {type: 'enum', values: ['1', '2', '3']},
    // 是否开启可用时间段 1全部 2部分
    'period_type': {type: 'enum', values: [1, 2, 3]},
    // 库存
    'stock': {type: 'integer', defaultValue: 1},
    // 每人限额
    'quota': {type: 'integer', defaultValue: 1},
    // 发放方式 1自领 2消费后领取
    'issue_way': {type: 'enum', values: ['1', '2', '3']},
    // 使用须知
    'notice': {type: 'text', size: 500},
    // 卡券标识图
    'first_figure': {type: 'text'},
    // 上下架状态 1上架 0下架
    'shelf_status': {type: 'integer'},
    // 排序标识
    'spec_order': {type: 'integer'},
    // 数据状态信息描述
    'info_desc': {type: 'text', defaultValue: ''},
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
            this['info_desc'] = '';
            next();
        },
        beforeSave(next) {
            next();
        }
    },
    methods: {
        getList() {
            const collect = {};
            for(let k in trans.card) {
                collect[trans.card[k]] = this[k];
            }
            return collect;
        }
    }
}

module.exports = {
    table,
    ops
}