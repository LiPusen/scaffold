const express = require('express');
const router = express.Router();
const rule = require('./rule');
const until = require('os-tool');
var _ = require('lodash');
const moment = require('moment');
const orm = require('orm');
// const trans = require('../orm/trans');

router.post('/addorupdate', (req, res, next) => {
    const param = req.body;
    if (param.userPId && param.userId) {
        req.models.distribution.one(
            {
                user_id: param.userId,
                user_pid: param.userPId
            },
            (err, _user) => {
                if (!_.isEmpty(_user)) {
                    //被邀请或已自行注册
                    res.json(
                        rule(200, {
                            info: '此用户已被邀请'
                        })
                    );
                } else {
                    //插入
                    req.models.distribution.one(
                        {
                            user_id: param.userPId
                        },
                        (err, _puser) => {
                            if (!_.isEmpty(_puser)) {
                                const pid = _puser.user_pid;
                                const user1 = {
                                    dis_id: until.uuid(16, 32),
                                    user_id: param.userId,
                                    user_pid: param.userPId,
                                    dis_level: 1
                                };

                                const user2 = {
                                    dis_id: until.uuid(16, 32),
                                    user_id: param.userId,
                                    user_pid: pid,
                                    dis_level: 2
                                };
                                req.models.distribution.create([user1, user2], (err, users) => {
                                    res.json(rule(200, users));
                                });
                            } else {
                                const user1 = {
                                    dis_id: until.uuid(16, 32),
                                    user_id: param.userId,
                                    user_pid: param.userPId,
                                    dis_level: 1
                                };
                                req.models.distribution.create([user1], (err, users) => {
                                    res.json(rule(200, users));
                                });
                            }
                        }
                    );
                }
            }
        );
    } else {
        res.json(
            rule(200, {
                info: '参数有误'
            })
        );
    }
});

router.post(
    '/getInviteList',
    (req, res, next) => {
        req.models.user
            .find({
                id: req.body.userId
            })
            .run((err, u) => {
                if (err) {
                    res.json(rule(301, until.ormErr(err)));
                } else {
                    console.log(u);
                    req.c = {};
                    req.c['user'] = u[0];
                    next();
                }
            });
    },
    (req, res, next) => {
        const final = {current: req.body.current, offset: 10};
        req.models.distribution.count(
            {
                user_pid: req.body.userId,
                dis_level: 1
            },
            (er1, rows) => {
                if(er1) console.log(until.ormErr(er1));
                final.rows = rows;
                final.pages = Math.ceil(rows / 10);
                req.c['page'] = final;
                req.c['invitelCount'] = rows;
                req.models.distribution.hasOne('userDistribution', req.models.user, {
                    field: 'user_id',
                    autoFetch: true
                });

                req.models.distribution.settings.set('pagination.perpage', 10);
                req.models.distribution
                    .page(req.body.current)
                    .find({
                        user_pid: req.body.userId,
                        dis_level: 1
                    })
                    .run((er2, list) => {
                        if (er2) res.json(rule(301, until.ormErr(er2)));
                        req.c['devoteList'] = list;
                        next();
                    });
            }
        );
    },
    (req, res, next) => {
        req.models.distribution
            .aggregate(['available_balance'], {
                user_pid: req.body.userId,
                dis_level: 1
            })
            .sum('available_balance')
            .get((err, purseAmount) => {
                if (err) {
                    res.json(rule(301, until.ormErr(err)));
                } else {
                    req.c['purseAmount'] = purseAmount;
                    next();
                }
            });
    },
    (req, res, next) => {
        req.models.distribution
            .aggregate(['available_balance'], {
                user_pid: req.body.userId,
                dis_level: 2
            })
            .sum('available_balance')
            .get((err, devoteAmount) => {
                if (err) {
                    res.json(rule(301, until.ormErr(err)));
                } else {
                    req.c['devoteAmount'] = devoteAmount;
                    next();
                }
            });
    },
    (req, res, next) => {
        let userPause = {};
        let devoteList = [];
        userPause.devoteAmount = _.isNull(req.c['devoteAmount']) ? 0 : req.c['devoteAmount'];
        userPause.purseAmount = _.isNull(req.c['purseAmount']) ? 0 : req.c['purseAmount'];
        userPause.invitelCount = req.c['invitelCount'];
        userPause.name = _.isNull(req.c['user']['nickname']) ? '' : req.c['user']['nickname'];
        userPause.pic = _.isNull(req.c['user']['pic_url']) ? '' : req.c['user']['pic_url'];
        userPause.page = req.c['page']
        req.c['devoteList'].forEach(function(user) {
            const _user = {
                money: _.isNull(user['available_balance']) ? 0 : user['available_balance'],
                name: _.isNull(user['userDistribution']['nickname']) ? '' : user['userDistribution']['nickname'],
                pic: _.isNull(user['userDistribution']['pic_url']) ? '' : user['userDistribution']['pic_url'],
                time: moment(new Date(user['update_time'])).format('YYYY-MM-DD HH:mm:ss')
            };
            devoteList.push(_user);
        }, this);
        userPause.devoteList = devoteList;
        res.json(rule(200, userPause));
    }
);
module.exports = router;
