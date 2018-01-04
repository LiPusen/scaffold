// 账号等信息配置文件
// mySql相关
const mysql = {
    host: "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com",
    port: 3306,
    user: "qmsdb",
    password: "jk23RuF!@9isaHf23",
    database: "qmsdb2"
} 

// b端微服务接口url
const bsUr = {
    oauth: "https://b-dev.qms888.com/qmsauth/oauth/check_token",
}

// 鉴权字符串集合
const os = {
    b: "Basic c2hvcDpzaG9w",
    c: "Basic Y3VzdG9tZXI6Y3VzdG9tZXI=",
    w: "Basic d2FpdGVyOndhaXRlcg=="
}

module.exports = {
      mysql,
      bsUr,
      os
};