var express = require('express');
var router = express.Router();
var rule = require('./rule');
var until = require('os-tool');
// 调试用假数据
var mock = require('./mock');
// 字段重命名
var trans = require('../orm/trans');
var _ = require('lodash');

//根据用户id获取用户绑定的店铺
router.post('/getUserShopes', (req, res, next) => {
    req.models.shopAccount.hasOne('shop', req.models.shop, { field: 'shop_id', autoFetch: true });
    req.models.shopAccount.find({ user_id: req.body.userId, status: 1 }).run((err, shopes) => {
        if (err) {
            console.log(until.ormErr(err));
            res.json(rule(301, until.ormErr(err)));
        } else {
            let result = [];

            shopes.forEach(shop => {
                result.push({
                    logo: shop.shop.logo || '',
                    shopId: shop.shop_id || '',
                    shopName: shop.shop.shop_name || ''
                });
            });

            res.json(rule(200, { rows: result }));
        }
    });
});

//根据店铺id获取桌台列表
router.post('/getTables', (req, res, next) => {
    req.models.shopTable.hasOne('tableType', req.models.shopTableType, { field: 'type', autoFetch: true });
    req.models.shopTable.find({ shop_id: req.body.shopId, status: 1 }).run((err, data) => {
        if (err) {
            console.log(until.ormErr(err));
            res.json(rule(301, until.ormErr(err)));
        } else {
            let result = {};

            data.forEach(table => {
                if (!result[table.type]) {
                    result[table.type] = {};
                    result[table.type].tables = [];
                }

                result[table.type].typeName = (table.tableType && table.tableType.type_name) || '';
                result[table.type].tables.push({
                    tableName: table.table_name || '',
                    isBind: !_.isEmpty(table.qr_code_id),
                    tableId: table.id || ''
                });
            });
            res.json(rule(200, { rows: Object.values(result) }));
        }
    });

    // let sql = `
    //     SELECT t.table_name, t.id, e.shop_employee_id, t.type, tt.type_name FROM shop_table t
    //     LEFT JOIN shop_table_type tt ON t.type = tt.id
    //     LEFT JOIN shop_employee_follow_table e ON e.table_id = t.id AND e.shop_id = t.shop_id
    //     WHERE t.shop_id = ${req.body.shopId} AND t.status = 1
    //     ORDER BY t.table_name
    // `;
    //req.models.db2.driver.execQuery(sql, (err, data)=>{})
});

//绑定桌台
router.post(
    '/bindTable',
    (req, res, next) => {
        req.models.shopTable.one({ id: req.body.tableId, status: 1 }, (err, data) => {
            if (err) {
                console.log(until.ormErr(err));
                res.json(rule(301, until.ormErr(err)));
            } else {
                if (_.isEmpty(data.qr_code_id)) {
                    req.c = data;
                    next();
                } else {
                    res.json(rule(301, { info: '该桌台已经存在二维码' }));
                }
            }
        });
    },
    (req, res, next) => {
        req.models.shopTable.one({ shop_id: req.body.shopId, qr_code_id: req.body.qrCode, status: 1 }, (err, data) => {
            if (err) {
                console.log(until.ormErr(err));
                res.json(rule(301, until.ormErr(err)));
            } else {
                if (data) {
                    res.json(rule(200, { isBind: 0 }));
                } else {
                    req.c.qr_code_id = req.body.qrCode;
                    req.c.save((e, d) => {
                        res.json(rule(200, { isBind: 1, info: '绑定成功' }));
                    });
                }
            }
        });
    }
);

//切换绑定桌台
router.post(
    '/switchTable',
    (req, res, next) => {
        req.models.shopTable.one({ id: req.body.tableId, status: 1 }, (err, data) => {
            if (err) {
                console.log(until.ormErr(err));
                res.json(rule(301, until.ormErr(err)));
            } else {
                if (_.isEmpty(data.qr_code_id)) {
                    req.c = data;
                    next();
                } else {
                    res.json(rule(301, { info: '该桌台已经存在二维码' }));
                }
            }
        });
    },
    (req, res, next) => {
        req.models.shopTable.one({ shop_id: req.body.shopId, qr_code_id: req.body.qrCode, status: 1 }, (err, data) => {
            if (err) {
                console.log(until.ormErr(err));
                res.json(rule(301, until.ormErr(err)));
            } else {
                data.qr_code_id = '';
                data.save(() => {
                    req.c.qr_code_id = req.body.qrCode;
                    req.c.save(() => {
                        res.json(rule(200, { info: '绑定成功' }));
                    });
                });
            }
        });
    }
);

module.exports = router;
