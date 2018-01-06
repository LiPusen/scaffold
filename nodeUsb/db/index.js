// 账号等信息配置文件
// mySql连接
const mysql = require("mysql");
const cof = require("../config");

// 主库连接
cof.mysql.database = cof.db.main;
const pool = mysql.createPool(cof.mysql);
// 卡券库连接
cof.mysql.database = cof.db.card;
const poolCard = mysql.createPool(cof.mysql);
// 建立主连接池
const mainQuery = (sql, arr, cb) => {
    pool.getConnection((err, connection) => {
        if(err) {
            cb && cb("数据库连接失败！", 500);
        } else {
            connection.query(sql, arr, (er, rows, field) => {
                cb && cb(er, rows);
                connection.release();
            })
        }
    })
}
// 建立卡券库连接池
const cardQuery = (sql, arr, cb) => {
    poolCard.getConnection((err, connection) => {
        if(err) {
            cb && cb("数据库连接失败！", 500);
        } else {
            connection.query(sql, arr, (er, rows, field) => {
                cb && cb(er, rows);
                connection.release();
            })
        }
    })
}

module.exports = {
    ...require('./bquery')(mainQuery, cardQuery),
    ...require('./appquery')(mainQuery, cardQuery)
}