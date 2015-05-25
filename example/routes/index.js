var express = require('express');
var router = express.Router();

var signature = require('../../index.js');
var config = require('../config')();
console.log(config);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index.html');
});

router.get('/favicon.ico', function(req, res, next) {
    res.send();
});


router.post('/getsignature', function(req, res) {
    var url = req.body.url;
    console.log(url);
    var getSignature = signature.getSignature(config);
    getSignature(url, function(error, result) {
        if (error) {
            res.json({
                'error': error
            });
        } else {
            res.json(result);
        }
    });

    //var getSignature = signature.getSignature(config);
    //getSignature(url)
    //    .then(function(data) {
    //        res.send(data);
    //    })
    //    .catch(function(err) {
    //        res.send({
    //            error: err
    //        });
    //    });
});

module.exports = router;
