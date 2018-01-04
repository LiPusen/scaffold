const api = require("../api");

module.exports = app => {
    app.use('/nodeCard', api.checkUser ,require('./coupon'));
}