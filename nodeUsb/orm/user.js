const orm = require('orm');

const table = {
    id: { type: 'text', key: true },
    nickname: { type: 'text' },
    pic_url: { type: 'text' }
}

const ops = {
    identityCache: false,
    timestamp: false,
    methods: {}
};

module.exports = {
    table,
    ops
};