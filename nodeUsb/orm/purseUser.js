/**
 * 钱袋用户绑定关系表
 */

const orm = require('orm');

const table = {
    // 钱袋编码
    purse_id: { type: 'text', key: true },
    // 主体类型
    body_type: { type: 'text' },
    // 主体Id
    body_id: { type: 'text' },
    // 用户名称
    body_name: { type: 'text' },
    // 用户手机号
    body_tel: { type: 'text' }
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
