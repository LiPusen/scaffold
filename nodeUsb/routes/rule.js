const _ = require('lodash');
// 接口规范
const rule = (code, data) => {
    switch (code) {
        case 200:
            return {code, msg: '请求成功！', body: _.isEmpty(data) ? {info: '操作成功！'} : data};
        case 301:
            return {code, msg: data.info || '查无数据！', body: _.isEmpty(data) ? {info: '操作失败！'} : data};
        case 401:
            return {code, msg: 'session失效，请重新登陆！', body: {}};
        default:
            return {code: 404, msg: '您访问了并不存在的API！', body: {}};      
    }
}

module.exports = rule;

/**
 * @编码规范：
 * 卡券UUID编码规则：kq + (l = 8，Hex = 32)随机字符串
 * 卡券类型编码规则：Q1 折扣券 Q2 优惠券 Q3 礼品券
 * 卡券原价和售价，默认为0
 * 折扣额度为1-9.9之间的数字，精确到小数点后1位
 * 不开启适用商品默认为：'全场通用，不限品类'
 * 我的卡券ID编码规则: i + (l = 10, Hex = 60)
 * 使用条件：优惠同享开启1不开启0
 */
/**
 * @卡券模块表结构设计规则
 * 卡券主表：card 针对B端业务卡券添加，卡券查询，及卡券状态等基础数据
 * 卡券使用的日期表：card_day 针对卡券的使用时间规则
 * 卡券详情表：card_detail 每张卡券的详情部分存储表
 * 我的卡券记录表：card_my C端用户所领取卡券的记录
 * 卡券销售领取记录表：card_chart 针对店铺或者卡券的领取或者销售记录
 */