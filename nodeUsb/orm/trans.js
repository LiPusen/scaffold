// 对数据库字段进行重命名
module.exports = {
    card: { card_name: 'cardName', card_type: 'cardType', orginal_price: 'orginalPrice', price: 'price', discount_rate: 'rate', is_share: 'isShare', item_suitable: 'con', cost: 'cost', validity_type: 'useType', period_type: 'periodType', stock: 'stock', quota: 'quota', issue_way: 'issueWay', notice: 'notice', first_figure: 'cardIcon', shelf_status: 'shelfSta', info_desc: 'info' },
    cday: obj => {
        let m = {},
            n = [];

        m['card_type'] = obj.cardType;
        n = obj.useDate ? obj.useDate.split('#') : '';
        // 固定时间段
        if (obj.useType == '1') {
            m['start_day'] = n[0] + ' 00:00:00';
            m['end_day'] = n[1] + ' 23:59:59';
            m['after_day'] = '';
            m['validity_day'] = '';
        } else {
            m['start_day'] = '';
            m['end_day'] = '';
            m['after_day'] = n[0];
            m['validity_day'] = n[1];
        }
        // 部分时间段
        if (obj.periodType != '1') {
            m['use_week'] = n[2];
            m['time'] = JSON.stringify(obj.time);
        } else {
            m['use_week'] = 0;
            m['time'] = JSON.stringify([]);
        }
        return m;
    },
    cmy: { my_id: 'cardno', card_id: 'cardId', card_name: 'cardName', card_type: 'cardType', orginal_price: 'orginalPrice', price: 'price', discount_rate: 'rate', is_share: 'isShare', item_suitable: 'con', cost: 'cost', notice: 'notice', effective: 'effective', failure: 'failure', time: 'time', use_week: 'useWeek', lose: 'lose', 'shop_id': 'shopId' },
    chartc: { card_name: 'cardName', card_type: 'cardType', sales: 'sales', csales: 'csales', selfs: 'selfs', afters: 'afters', onlines: 'onlines', offlines: 'offlines', expires: 'expires' },
    generalize: { dis_id: 'id', user_id: 'userId', user_pid: 'userPid', is_delete: 'isDelete', info_desc: 'detail', info_status: 'status', create_time: 'createTime', create_user: 'createUser', update_time: 'updateTime', update_user: 'updateUser' },
    // 钱袋信息
    purseInfo: { purse_id: 'purseId', available_balance: 'availableBalance', freezing_balance: 'freezingBalance' }
};
