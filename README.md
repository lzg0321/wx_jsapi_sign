# wx_jsapi_sign(nodejs)

wx_jsapi_sign = wechat(微信) js-api signature implement.

[![npm version](https://badge.fury.io/js/wx_jsapi_sign.svg)](http://badge.fury.io/js/wx_jsapi_sign)

## Install 

    npm install --save wx_jsapi_sign

## Usage

copy config file

```
cp node_modules/wx_jsapi_sign/config.example.js config.js
```

then mount a route in app.js

```
var signature = require('wx_jsapi_sign');
var config = require('./config')();

....

app.use('/getsignature', function(req, res){
  var url = req.body.url;
  console.log(url);
  signature.getSignature(config)(url, function(error, result) {
        if (error) {
            res.json({
                'error': error
            });
        } else {
            res.json(result);
        }
    });
});
```

more usages see `test/public/test.html`

## Test

微信访问网址  `http://yourserver.com:1342/test`


## 原作者博客

http://blog.xinshangshangxin.com/2015/04/22/%E4%BD%BF%E7%94%A8nodejs-%E8%B8%A9%E5%9D%91%E5%BE%AE%E4%BF%A1JS-SDK%E8%AE%B0%E5%BD%95/
