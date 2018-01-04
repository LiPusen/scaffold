var express = require('express');
var router = express.Router();
var api = require("../api");
var rule = require("./rule");

router.post('/getList', (req, res, next) => {
    api.queryCardList().then((data) => res.json(rule(200, data)), (er) => {
        typeof(er.code) == "number" ? res.status(er.code).send(er.msg) : res.json(rule(301));
    })
})

module.exports = router;