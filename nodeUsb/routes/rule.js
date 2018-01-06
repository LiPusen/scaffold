// 接口规范
const rule = (code, data) => {
    switch (code) {
        case 200:
            return {code, msg: '请求成功！', body: data};
        case 301:
            return {code, msg: data || '查无数据！', body: {}};
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
 * 卡券类型编码规则：Q01 折扣券 Q02 优惠券 Q03 礼品券
 * 卡券原价和售价，默认为0
 * 折扣额度为1-9.9之间的数字，精确到小数点后1位
 * 不开启适用商品默认为：'全场通用，不限品类'
 *
 */
/**
 * @卡券模块表结构设计规则
 * 卡券主表：card 针对B端业务卡券添加，卡券查询，及卡券状态等基础数据
 * 卡券使用的日期表：card_day 针对卡券以天为单位的使用规则
 * 卡券使用的时间段表：card_time 针对天内的时间段的使用规则
 * 卡券详情表：card_detail 每张卡券的详情部分存储表
 * 卡券核销记录表：card_verify 每张卡券使用后的核销记录，从C端发起
 * 我的卡券记录表：card_my C端用户所领取卡券的记录
 * 卡券销售领取记录表：card_report 针对店铺或者卡券的领取或者销售记录
 */