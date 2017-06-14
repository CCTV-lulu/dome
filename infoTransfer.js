var http = require('http')
var express = require('express')
var fs = require('fs')
var unirest = require('unirest')
var Stream = require('stream').Transform

var parameter = {
        'keyword':['a','b'] ,
        'pageSize': 2,
        'pageNo': 1,
        'key': '89abb2115a1dc9df29da7f52746486db',
        'keyword_index':0,
        'max_pageNo':3
    }

if(fs.exists('ErrorFile.txt')){
    var data=readFile('ErrorFile')
    var seat=data.split(',')
    option={
        'keyword':seat[1].split(':')[1],
        'pageSize': parameter.pageSize,
        'pageNo': seat[2].split(':')[1],
        'key': parameter.key,
        'keyword_index':0,
        'max_pageNo':1
    }
}else {
    option=parameter
}

function getJson(option, cb) {
    var url = 'http://japi.juhe.cn/trademark/search?keyword='
        + option.keyword[option.keyword_index] + '&pageSize=' + option.pageSize +
        '&pageNo=' + option.pageNo + '&key=' + option.key

    unirest.get(url)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send()
        .end(function (response) {
            console.log( JSON.stringify(response.body))
            if (response.error) {
                coverFile('ErrorFile', 'ErrorType:CallaFiled'+',keyword:' + option.keyword[option.keyword_index] + ',pageNo:' + option.pageNo)
            }
            else {
                if(!fs.existsSync('./trademarkInfo')){
                    fs.mkdirSync('./trademarkInfo')
                }
                fs.appendFileSync('./requestFile.txt', '[keyword:' + option.keyword[option.keyword_index] + ',pageNo:' + option.pageNo+']')
                var newResult = response.body
                if (newResult.error_code == 0) {
                    writeFile(option.keyword[option.keyword_index], newResult.result.data)

                    console.log( JSON.stringify(newResult.result)=='{}')
                    if(JSON.stringify(newResult.result)!='{}') {
                        if (newResult.result.data.length == option.pageSize && option.pageNo < option.max_pageNo) {
                            console.log('===============')
                            option.pageNo += 1
                            return getJson(option, cb)
                        }


                        if (option.keyword_index < option.keyword.length - 1) {
                            option.keyword_index += 1;
                            option.pageNo = 1;
                            return getJson(option, cb)
                        }
                    }else {
                        option.keyword_index += 1;
                            option.pageNo = 1;
                            return getJson(option, cb)
                    }
                    cb()
                }
                else if (newResult.error_code == 10012) {
                    return coverFile('ErrorFile', 'ErrorType:HasNoMany'+',keyword:' + option.keyword[option.keyword_index] + ',pageNo:' + option.pageNo)
                }

            }
        })
}

function writeFile(keyword, data) {
    var txt_info =  readFile('trademarkInfo/'+keyword);
    if (txt_info == null) {
        fs.writeFileSync('./trademarkInfo/' + keyword + '.txt',JSON.stringify(data))
    } else {
        var result=JSON.parse(txt_info).concat(data)
         // fs.unlinkSync('./trademarkInfo/' + keyword + '.txt')
         fs.writeFileSync('./trademarkInfo/' + keyword + '.txt',JSON.stringify(result))
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
    option.keyword.forEach(function (i) {
        if(!fs.existsSync('./'+i)){
            fs.mkdirSync(i)
        }
        var info =  readFile('trademarkInfo/'+i)
        if(info!=null) {
            JSON.parse(info).forEach(function (k) {
                    if (k!=null) {
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
        }
    })
})

