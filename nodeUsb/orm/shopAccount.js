const trans = require('./trans');

// shop_account表设计
const table = {
    id: { type: 'text', key: true },
    user_id: { type: 'text' },
    shop_id: { type: 'integer' }
};

const ops = {
    id: 'id',
    validations: {},
    identityCache: false,
    collection: '',
    hooks: {},
    methods: {
        getList() {
            const collect = {};
            for (let k in trans.chartc) {
                collect[trans.chartc[k]] = this[k];
            }
            return collect;
        }
    }
};

module.exports = {
    table,
    ops
};
