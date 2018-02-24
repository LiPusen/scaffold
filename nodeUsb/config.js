// 账号等信息配置文件
// mySql相关
const mysql = {main: {}, card: {}, purse: {}};

// 鉴权字符串集合
const os = {
    b: "Basic c2hvcDpzaG9w",
    c: "Basic Y3VzdG9tZXI6Y3VzdG9tZXI=",
    w: "Basic d2FpdGVyOndhaXRlcg=="
}
switch (process.env.MIU) {
    case 'dev':
        // 主库
        mysql.main.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.main.port = 3306;
        mysql.main.user = "qmsdb";
        mysql.main.password = "jk23RuF!@9isaHf23";
        mysql.main.db = 'qmsdb2';
        // 卡券库
        mysql.card.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.card.port = 3306;
        mysql.card.user = "qmsdb";
        mysql.card.password = "jk23RuF!@9isaHf23";
        mysql.card.db = 'qms_card';
        // 钱袋库
        mysql.purse.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.purse.port = 3306;
        mysql.purse.user = "qmsdb";
        mysql.purse.password = "jk23RuF!@9isaHf23";
        mysql.purse.db = 'qms_purse';
        break;
    case 'test':
        //  主库
        mysql.main.host = "rdspgnw3q0t88gh3mbnq8.mysql.rds.aliyuncs.com";
        mysql.main.port = 3306;
        mysql.main.user = "qmstestdb";
        mysql.main.password = "s238d8jk23rjx89s@34";
        mysql.main.db = 'qmstestdb2';
        // 卡券库
        mysql.card.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.card.port = 3306;
        mysql.card.user = "nodeserver";
        mysql.card.password = "node&qms@110";
        mysql.card.db = 'qmscardtest';
        // 钱袋库
        mysql.purse.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.purse.port = 3306;
        mysql.purse.user = "qmspursetest";
        mysql.purse.password = "jk23RuF!@9isaHf23383";
        mysql.purse.db = 'qmspursetestdb';
        break;
    case 'prod':
        // 主库
        mysql.main.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.main.port = 3306;
        mysql.main.user = "qmsdb";
        mysql.main.password = "jk23RuF!@9isaHf23";
        mysql.main.db = 'qmsdb2';
        // 卡券库
        mysql.card.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.card.port = 3306;
        mysql.card.user = "qmsdb";
        mysql.card.password = "jk23RuF!@9isaHf23";
        mysql.card.db = 'qms_card';
        break;
    default:
        process.env.SHOP = process.env.NODE_ENV;
        process.env.USER = process.env.NODE_ENV;
        // 主库
        mysql.main.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.main.port = 3306;
        mysql.main.user = "qmsdb";
        mysql.main.password = "jk23RuF!@9isaHf23";
        mysql.main.db = 'qmsdb2';
        // 卡券库
        mysql.card.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.card.port = 3306;
        mysql.card.user = "qmsdb";
        mysql.card.password = "jk23RuF!@9isaHf23";
        mysql.card.db = 'qms_card';
        // 钱袋库
        mysql.purse.host = "rm-2ze2g7ns6cx4y9346o.mysql.rds.aliyuncs.com";
        mysql.purse.port = 3306;
        mysql.purse.user = "qmsdb";
        mysql.purse.password = "jk23RuF!@9isaHf23";
        mysql.purse.db = 'qms_purse';
        break;
}
// b端微服务接口url
const bsUr = {
    oauth: process.env.NODE_ENV + "/qmsauth/oauth/check_token",
    getCTel: process.env.USER + "/qmsuser/user/queryContacts",
    getShopInfo: process.env.SHOP + "/api-shop/shop/queryShopBriefInfo"
}

module.exports = {
      mysql,
      bsUr,
      os
};