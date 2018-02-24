var _ = require('lodash');
// 请求参数验证中间件
module.exports = {
    addCard: (req, res, next) => {
        if(!_.trim(req.body.cardName)) {
            res.json({code: 301, msg: '卡券名称不能为空！'});
        } else if(_.trim(req.body.cardName).length > 50) {
            res.json({code: 301, msg: '卡券名称必须在50个字符内！'});
        } else if(Number(req.body.stock) < 1) {
            res.json({code: 301, msg: '库存数量至少为1份！'});
        } else if(Number(req.body.stock) > 9999) {
            res.json({code: 301, msg: '库存数量不能大于9999！'});
        } else if(Number(req.body.quota) < 1) {
            res.json({code: 301, msg: '每人限额至少为1份！'});
        } else if(Number(req.body.quota) > 9999) {
            res.json({code: 301, msg: '每人限额不能大于9999！'});
        } else if(Number(req.body.quota) > Number(req.body.stock)) {
            res.json({code: 301, msg: '每人限额不能大于总库存数量！'});
        } else if(!_.trim(req.body.notice)) {
            res.json({code: 301, msg: '卡券描述不能为空！'});
        } else if(_.trim(req.body.notice).length > 500) {
            res.json({code: 301, msg: '卡券描述必须在500个字符内！'});
        } else {
            next();
        }
    }
}