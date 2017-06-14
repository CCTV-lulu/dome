var http = require('http')
var express = require('express')
var fs = require('fs')
var unirest = require('unirest')
var Stream = require('stream').Transform

var parameter = {
        'keywork':['j','i'] ,
        'pageSize': 5,
        'pageNo': 1,
        'key': '89abb2115a1dc9df29da7f52746486db',
        'keyword_index':0
    }

if(fs.exists('没钱了.txt')){
    var data=readFile('没钱了')
    var seat=data.split(',')
    option={
        'keywork':seat[0].split(':')[1],
        'pageSize': parameter.pageSize,
        'pageNo': seat[1].split(':')[1],
        'key': parameter.key,
        'keyword_index':0
    }
}else {
    option=parameter
}

function getJson(option, cb) {
    var url = 'http://japi.juhe.cn/trademark/search?keyword='
        + option.keywork[option.keyword_index] + '&pageSize=' + option.pageSize +
        '&pageNo=' + option.pageNo + '&key=' + option.key

    unirest.get(url)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send()
        .end(function (response) {
            if (response.error) {
                writeFile('调用失败', 'keyword:' + option.keywork[option.keyword_index] + ',pageNo:' + option.pageNo)
            }
            else {
                writeFile('请求', 'keyword:' + option.keywork[option.keyword_index] + ',pageNo:' + option.pageNo)
                var newResult = JSON.parse(response.body)
                if (newResult.error_code == 0) {
                    writeFile(option.keywork[option.keyword_index], JSON.stringify(newResult.result.data))
                    if (newResult.result.data.length === option.pageSize && option.pageNo < 1) {
                        option.pageNo += 1
                        return getJson(option, cb)
                    }
                    if (option.keyword_index<option.keywork.length-1){
                        option.keyword_index+=1;
                        option.pageNo=1;
                        return getJson(option, cb)
                    }
                    else {
                        cb()
                    }
                }
                else if (newResult.error_code == 10012) {
                    return coverFile('没钱了', 'keyword:' + option.keywork[option.keyword_index] + ',pageNo:' + option.pageNo)
                }

            }
        })
}

function writeFile(keyword, data) {
    var txt_info =  readFile(keyword);
    if (txt_info == null) {
        fs.appendFileSync('./' + keyword + '.txt', data)
    } else {
        fs.appendFileSync('./' + keyword + '.txt', '*' + data)
    }
}

function readFile(keyword) {
    var txt_file = fs.existsSync('./' + keyword + '.txt')
    if (txt_file == true) {
        var data = fs.readFileSync('./' + keyword + '.txt',{flag: 'r+', encoding: 'utf8'})
        return data
    } else {
        return null
    }

    }
function coverFile(keyword,data) {
    if(fs.existsSync('./'+keyword+'.txt')){
        fs.unlinkSync('./'+keyword+'.txt')
        fs.writeFileSync('./'+keyword+'.txt',data)
    }
    else {
        fs.writeFileSync('./'+keyword+'.txt',data)
    }
}

getJson(option, function () {
    option.keywork.forEach(function (i) {
        if(!fs.existsSync('./'+i)){
            fs.mkdirSync(i)
        }
        var info =  readFile(i)
        if(info!=null) {
            var newImg = []
            newImg = info.split('*')
            newImg.forEach(function (a) {
                var datainfo = JSON.parse(a)
                datainfo.forEach(function (k) {
                    if (k.tmImg!=undefined) {
                        var lastimg = 'http://pic.tmkoo.com/pic.php?zch=' + k.tmImg
                        http.request(lastimg, function (response) {
                            var data = new Stream();

                            response.on('data', function (chunk) {
                                data.push(chunk)
                            })

                            response.on('end', function () {
                                fs.writeFile('./' + i + '/' + k.tmImg + '.png', data.read())
                            })

                        }).end()
                    }
                })
            })
        }
    })
})

