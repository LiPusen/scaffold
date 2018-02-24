const trans = require('./trans');

// shop_table_type表设计
const table = {
    id: { type: 'integer', key: true },
    type_name: { type: 'text' } //桌台分类名称
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
