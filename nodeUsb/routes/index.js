const m = require('../middleware');

// b-api 店家端接口
// app-api 顾客端接口
module.exports = app => {
    // 卡券B端接口服务
    // app.use('/b-api/nodeCard', m.bCheckUser, require('./bcard'));
    app.use('/b-api/nodeCard', require('./bcard'));
    // 卡券C端接口服务
    app.use('/app-api/nodeCard', require('./appcard'));
    // 桌台绑定C端接口服务
    app.use('/app-api/tablemng', require('./tablemng'));
    // 人人推广C端接口服务
    app.use('/app-api/rrpase', require('./generalize'));
};
