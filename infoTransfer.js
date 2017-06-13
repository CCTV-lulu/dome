var http = require('http')
var express = require('express')
var fs = require('fs')
var unirest = require('unirest')
var Stream = require('stream').Transform

  option = {
        'keywork':['a','b','c'] ,
        'pageSize': 50,
        'pageNo': 1,
        'key': 'c08e1a7c77a8f45bf74c9c2550f258af'
    }

var i=0
    function getJson(option, cb) {
        unirest.get('http://japi.juhe.cn/trademark/search?keyword=' + option.keywork[i] + '&pageSize=' + option.pageSize +
            '&pageNo=' + option.pageNo + '&key=' + option.key)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send()
            .end(function (response) {
                if (response.error) {
                    saveJson('调用失败', 'keyword:' + option.keywork[i] + ',pageNo:' + option.pageNo)
                }
                else {
                    saveJson('请求', 'keyword:' + option.keywork[i] + ',pageNo:' + option.pageNo)
                    var newResult = JSON.parse(response.body)
                    if (newResult.error_code == 0) {
                        fs.mkdirSync(option.keywork[i])
                        saveJson(option.keywork[i], response.body)
                        if (newResult.result.data.length === option.pageSize && option.pageNo < 3) {
                            option.pageNo += 1
                            return getJson(option, cb)
                        }
                        else {/*取下一个关键字*/
                            i+=1&&i<option.keywork.length
                            return getJson(option, cb)
                        }
                        cb()
                    }
                    else if (newResult.error_code == 10012) {
                        saveJson('没钱了', 'keyword:' + option.keywork[i] + ',pageNo:' + option.pageNo)
                        //修改参数，重新启动终端时继续跑
                        
                    }

                }
            })
    }

    function saveJson(keyword, data) {
        var txt_info = readJson(keyword);
        if (txt_info == null) {
            fs.appendFile('./' + keyword + '.txt', data)
        } else {
            fs.appendFile('./' + keyword + '.txt', '*' + data)
        }
    }

    function readJson(keyword) {
        var txt_file = fs.existsSync('./' + keyword + '.txt')
        if (txt_file == true) {
            var data = fs.readFileSync('./' + keyword + '.txt')
            return data.toString()
        } else {
            return null
        }

    }



getJson(option, function () {
    option.keywork.forEach(function (i) {
        var info = readJson(option.keywork[i])
        var newImg = []
        newImg = info.split('*')
        newImg.forEach(function (a) {
            var datainfo = JSON.parse(a)
            datainfo.result.data.forEach(function (k) {
                var lastimg = 'http://pic.tmkoo.com/pic.php?zch=' + k.tmImg
                http.request(lastimg, function (response) {
                    var data = new Stream();

                    response.on('data', function (chunk) {
                        data.push(chunk)
                    })

                    response.on('end', function () {
                        fs.writeFile('./' + option.keywork + '/' + k.tmImg + '.png', data.read())
                    })

                }).end()
            })
        })
    })
})












