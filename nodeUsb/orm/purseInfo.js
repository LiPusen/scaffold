/**
 * 钱袋信息表
 */

const orm = require('orm')
const trans = require('./trans');

const table = {
    // 钱袋编码
    purse_id: { type: 'text', key: true },
    // 可用余额
    available_balance: { type: 'number' },
    // 冻结余额
    freezing_balance: { type: 'number' }
}

const ops = {
    identityCache: false,
    timestamp: true,
    methods: {
        getList() {
            const collect = {};
            for(let k in trans.purseInfo) {
                collect[trans.purseInfo[k]] = this[k];
            }
            return collect;
        }
    }
};

module.exports = {
    table,
    ops
};