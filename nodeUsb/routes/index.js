const m = require('../middleware');

// b-api 店家端接口
// app-api 顾客端接口
module.exports = app => {
    app.use('/b-api/nodeCard', m.bCheckUser, require('./bcard'));
    app.use('/app-api/nodeCard', require('./appcard'));
}