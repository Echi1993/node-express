var crypto = require('crypto');
module.exports = function (str) {
    var crypto_md5 = crypto.createHash('md5');
    crypto_md5.update(str, 'utf8'); // 加入编码
    return crypto_md5.digest('hex');
};


