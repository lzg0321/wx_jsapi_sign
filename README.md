# 说明
1. 使用node作为服务器生成JS-SDK权限验证的签名
2. 菜鸟尝试微信JS-SDK,欢迎批评

# 使用说明
1. 下载 或 `git clone` 源码
2. `npm install` 安装 依赖包
3. 修改 `config.js`, 填写你的配置
4. 修改 `public/test.html` 下 156行 左右的服务器信息
5. 挂载到你的服务器/外网映射
6. 微信访问网址  `http://yourserver.com/test`
7. 我的踩坑记录 http://blog.xinshangshangxin.com/2015/04/22/%E4%BD%BF%E7%94%A8nodejs-%E8%B8%A9%E5%9D%91%E5%BE%AE%E4%BF%A1JS-SDK%E8%AE%B0%E5%BD%95/

http://127.0.0.1:1342/test

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


