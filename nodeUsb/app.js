var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// 接口
var route = require("./routes");
// orm
var orm = require('./orm');
// 定时任务
var timeTask = require('./timetask');

var app = express();
// 全局请求中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
console.log(process.env.NODE_ENV)
// 静态资源仓库
app.use(express.static('www'));
// 跨域
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");//预检请求使用
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");//预检请求使用
    next();
});

orm(app);
route(app);

// require('./sequelize');

app.set('port', process.env.PORT || 3005);
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
