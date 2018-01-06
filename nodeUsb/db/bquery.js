// b端数据库查询
module.exports = (main, card) => {
    // 卡券列表查询
    const bGetList = () => {
        return new Promise((resolve, reject) => {
            main('select * from banner where id = ?', [1],(msg, rows) => {
                msg ? reject({msg, code: rows}) : resolve(rows);
            })
        })
    }
    // 输出查询接口
    return {
        bGetList
    }
}