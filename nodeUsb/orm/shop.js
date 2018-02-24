// shop表设计
const table = {
    // 店铺ID， 主键
    id: { type: 'text', key: true },
    // 卡券数量
    card_counter: { type: 'integer' },
    // 卡券详情
    card_content_json: { type: 'text' },
    //店铺名称
    shop_name: { type: 'text' },
    //店铺logo
    logo: { type: 'text' }
};

const ops = {
    id: 'id',
    validations: {},
    identityCache: false,
    collection: '',
    hooks: {},
    methods: {}
};

module.exports = {
    table,
    ops
};
