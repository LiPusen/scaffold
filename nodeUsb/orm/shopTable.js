const trans = require('./trans');

// shop_table表设计
const table = {
    id: { type: 'integer', key: true },
    type: { type: 'integer' }, //桌台分类
    table_name: { type: 'text' }, //桌台名称
    qr_code_id: { type: 'text' } //桌子二维码
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
