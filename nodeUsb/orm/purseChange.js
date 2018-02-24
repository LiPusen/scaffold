/**
 * 钱袋资金变动记录
 */
const orm = require('orm');
const trans = require('./trans');

const table = {
    // 变动记录Id
    change_id: { type: 'text', key: true },
    // 钱袋编码
    purse_id: { type: 'text' },
    // 变动类型 1:增加，0:扣减
    change_type: { type: 'text' },
    // 变动金额
    change_amount: { type: 'number' },
    // 变动后金额
    change_balance: { type: 'number' },
    // 业务类型 5:一级分销，6:二级分销
    business_type: { type: 'text' }
}

const ops = {
    identityCache: false,
    timestamp: true,
    methods: {}
};

module.exports = {
    table,
    ops
};