const orm = require('orm');
// const trans = require('./trans');

const table = {
    dis_id: { type: 'text', key: true },
    user_id: { type: 'text' },
    user_pid: { type: 'text' },
    dis_level: { type: 'integer' },
    available_balance: { type: 'number' },
    create_time: { type: 'date', time: true }
};
const ops = {
    identityCache: false,
    timestamp: true,
    methods: {}
};

module.exports = {
    table,
    ops
};
