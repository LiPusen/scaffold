// 使用面向对象的方式操作数据库
const orm = require('orm');
// 全文匹配搜索插件
const fts = require('orm-mysql-fts');
// 分页查询插件
const paging = require('orm-paging');
// 实现查询事务化插件
const thing = require('orm-transaction');
// 自动生成时间戳
const modts = require('orm-timestamps');
// 相关参数
const cof = require('../config');
// 加载相关表
const cardTab = require('./card');
const cardDayTab = require('./cardDay');
const myCardTab = require('./myCard');
const chartCardTab = require('./chartCard');
const shopTab = require('./shop');

const generalizeTab = require('./generalize');
const shopAccount = require('./shopAccount');
const shopTable = require('./shopTable');
const shopTableType = require('./shopTableType');

// 钱袋
const purseInfoTable = require('./purseInfo')
const purseChangeTable = require('./purseChange')
const purseUserTable = require('./purseUser')

const userTable =  require('./user')
// 全局设置相关错误返回
orm.settings.set('instance.returnAllErrors', true);
orm.settings.set('pagination.perpage', 10);

module.exports = app => {
    // card库
    const card = 'mysql://' + cof.mysql.card.user + ':' + cof.mysql.card.password + '@' + cof.mysql.card.host + '/' + cof.mysql.card.db + '?pool=true';
    app.use(
        orm.express(card, {
            define: function(db, models, next) {
                models.db = db;
                // 载入插件
                db.use(fts);
                db.use(paging);
                db.use(thing);
                db.use(modts, {
                    createdProperty: 'create_time',
                    modifiedProperty: 'update_time',
                    expireProperty: false,
                    dbtype: { type: 'date', time: true },
                    now: function() {
                        return new Date();
                    },
                    expire: function() {
                        var d = new Date();
                        return d.setMinutes(d.getMinutes() + 60);
                    },
                    persist: true
                });
                // 初始化卡券主表
                models.card = db.define('card', cardTab.table, cardTab.ops);
                // 初始化卡券使用日期规则
                models.cardDay = db.define('card_day', cardDayTab.table, cardDayTab.ops);
                // 初始化我的卡券表
                models.myCard = db.define('card_my', myCardTab.table, myCardTab.ops);
                // 卡券使用情况报表统计
                models.chartCard = db.define('card_chart', chartCardTab.table, chartCardTab.ops);
                next();
            }
        })
    );

    //钱袋库
    const purse = 'mysql://' + cof.mysql.purse.user + ':' + cof.mysql.purse.password + '@' + cof.mysql.purse.host + '/' + cof.mysql.purse.db + '?pool=true'
    app.use(
        orm.express(purse, {
             define: function(db, models, next) {
                models.db = db;
                // 载入插件
                db.use(fts);
                db.use(paging);
                db.use(thing);
                
                // 初始化钱袋表
                models.purseInfo = db.define('qms_purse_info', purseInfoTable.table, purseInfoTable.ops);
                // 初始化钱袋变动记录表
                models.purseChange = db.define('qms_purse_change', purseChangeTable.table, purseChangeTable.ops); 
                // 初始化用户--钱袋关系表
                models.purseUser = db.define('qms_purse_user_binding', purseUserTable.table, purseUserTable.ops); 
                 
                next();
            }
        })
    )
    // 主库
    const main = 'mysql://' + cof.mysql.main.user + ':' + cof.mysql.main.password + '@' + cof.mysql.main.host + '/' + cof.mysql.main.db + '?pool=true';
    app.use(
        orm.express(main, {
            define: function(db, models, next) {
                models.db2 = db;
                db.use(paging);
                // 初始化店铺主表
                db.use(modts, {
                    createdProperty: 'create_time',
                    modifiedProperty: 'update_time',
                    expireProperty: false,
                    dbtype: { type: 'date', time: true },
                    now: function() {
                        return new Date();
                    },
                    expire: function() {
                        var d = new Date();
                        return d.setMinutes(d.getMinutes() + 60);
                    },
                    persist: true
                });
                models.user =  db.define('user', userTable.table, userTable.ops);
                models.shop = db.define('shop', shopTab.table, shopTab.ops);
                models.shopAccount = db.define('shop_account', shopAccount.table, shopAccount.ops);
                models.shopTable = db.define('shop_table', shopTable.table, shopTable.ops);
                models.shopTableType = db.define('shop_table_type', shopTableType.table, shopTableType.ops);
                models.distribution = db.define('user_distribution', generalizeTab.table, generalizeTab.ops);
                next();
            }
        })
    );
};
