// 生成UUID
const uuid = (l, radix) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uid = [], i;
    radix = radix || chars.length;
 
    if (l) {
      // 随机生成任意字符组合uuid，重复度较高
      for (i = 0; i < l; i++) uid[i] = chars[0 | Math.random()*radix];
    } else {
      let r;
 
      // 转换编码格式
      uid[8] = uid[13] = uid[18] = uid[23] = '-';
      uid[14] = '8';
 
      // 替换随机值.  At i==19 set the high bits of clock sequence
      for (i = 0; i < 36; i++) {
        if (!uid[i]) {
          r = 0 | Math.random()*16;
          uid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uid.join('');
}

module.exports = {
    uuid,
}