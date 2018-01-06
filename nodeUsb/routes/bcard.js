var express = require('express');
var router = express.Router();
var dbs = require("../db");
var rule = require("./rule");
var until = require('os-tool');

router.post('/getList', (req, res, next) => {
    console.log(req.body)
    dbs.bGetList().then((data) => res.json(rule(200, data)), (er) => {
        typeof(er.code) == "number" ? res.status(er.code).send(er.msg) : res.json(rule(301));
    })
})

module.exports = router;

const list = {
    shopId: 1154,
    id: "",
    type: "",
    name: "我是卡券",
    
}