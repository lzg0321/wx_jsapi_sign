var crypto = require('crypto');
var request = require('request');
var fs = require('fs-extra');
var path = require('path');
var q = require('q');

var cache = {
    ticket: null,
    time: 0
};

function getSignature(config, url) {
    console.log('start getSignature');

    var defered = q.defer();
    // 判断内存中是否有缓存
    if (!cache || !cache.ticket) {
        console.log('readCache from cache.json');
        var cachePath = path.join((config.cache_json_file || ''), './cache.json');
        // 从磁盘中获取
        fs.ensureFile(cachePath, function(err) {
            fs.readJson(cachePath, function(err, cache_json) {
                if (err) {
                }
                else {
                    cache = cache_json;
                }
                tryGetSignature(config, url)
                    .then(function(data) {
                        defered.resolve(data);
                    })
                    .catch(function(e) {
                        defered.reject(e);
                    });
            });
        })

    }
    else {
        tryGetSignature(config, url)
            .then(function(data) {
                defered.resolve(data);
            });
    }

    return defered.promise;
}

function getToken(config) {

    var defered = q.defer();

    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;

    request.get(tokenUrl, function(error, response, body) {
        if (error) {
            defered.reject(error);
        }
        else {
            try {
                var token = JSON.parse(body).access_token;
                defered.resolve(token);
            }
            catch (e) {
                defered.reject(e);
            }
        }
    });

    return defered.promise;
}

function getNewTicket(token) {

    var defered = q.defer();

    request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', function(error, res, body) {
        if (error) {
            defered.reject(error);
        }
        else {
            try {
                var ticket = JSON.parse(body).ticket;
                defered.resolve(ticket);
            }
            catch (e) {
                defered.reject('getNewTicketError');
            }
        }
    });

    return defered.promise;
}

function tryGetSignature(config, u) {

    var defered = q.defer();
    // 判断cache 是否过期
    if (!cache.ticket || (new Date().getTime() - cache.time) > 7000000) {
        cache.time = cache.time + 10 * 1000;  // 缓解高并发多次获取

        getToken(config)
            .then(function(token) {
                return getNewTicket(token);
            })
            .then(function(ticket) {
                cache.ticket = ticket;
                cache.time = new Date().getTime();

                // 文件保存
                fs.writeJson(
                    path.join((config.cache_json_file || ''), './cache.json'),
                    cache,
                    function(err) {
                        console.log(err)
                    });


                var timestamp = getTimesTamp();
                var noncestr = getNonceStr();
                var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + u;
                var signature = crypto.createHash('sha1').update(str).digest('hex');
                defered.resolve({
                    appId: config.appId,
                    timestamp: timestamp,
                    nonceStr: noncestr,
                    signature: signature
                });
            })
            .catch(function(e) {
                defered.reject(e);
            });


    }
    else {
        console.log('缓存获取');
        var timestamp = getTimesTamp();
        var noncestr = getNonceStr();
        var str = 'jsapi_ticket=' + cache.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + u;
        console.log(str);
        var signature = crypto.createHash('sha1').update(str).digest('hex');
        defered.resolve({
            appId: config.appId,
            timestamp: timestamp,
            nonceStr: noncestr,
            signature: signature
        });
    }

    return defered.promise;
}

function getTimesTamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

function getNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

exports.getSignature = function(config) {
    return function(url, cb) {
        if (cb) {
            getSignature(config, url)
                .then(function(data) {
                    cb(null, data);
                })
                .catch(function(e) {
                    cb(e);
                })
        }
        else {
            return getSignature(config, url);
        }
    }
};