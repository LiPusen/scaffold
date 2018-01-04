// 账号等信息配置文件
// mySql连接
const mysql = require("mysql");
const cof = require("../config");
const axios = require("axios");
const pool = mysql.createPool(cof.mysql);

const query = (sql, cb) => {
    pool.getConnection((err, connection) => {
        if(err) {
            cb && cb("数据库连接失败！", 500);
        } else {
            connection.query(sql, (er, rows) => {
                cb && cb(er, rows);
                connection.release();
            })
        }
    })
}

// 实例化请求
const xhr = axios.create({timeout: 5000});

// 用户合法性校验中间件
const checkUser = (req, res, next) => {
    xhr.post(cof.bsUr.oauth, 'token=' + req.headers.session, { headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8','Authorization': cof.os.b } }).then(data => {
        next();
    }, er => {
        res.status(401).send('session失效，请重新登陆！');
    })
}

// 请求卡券列表
const queryCardList = () => {
    return new Promise((resolve, reject) => {
        query('select * from banner', (msg, rows) => {
            msg ? reject({msg, code: rows}) : resolve(rows);
        })
    })
}

module.exports = {
    query,
    checkUser,
    queryCardList
}