var http = require('http')
var express = require('express')
var fs = require('fs')
var unirest = require('unirest')

var Stream = require('stream').Transform

option = {
    'keywork': '1',
    'pageSize': 5,
    'pageNo': 1,
    'key': '851b9d5cb32615d69c05bcd500be7cfe'
}


if (!fs.exists(option.keywork)) {
    fs.mkdir(option.keywork, function (err) {
        if (err) {
            console.log(err)
        }
    })
}

function getJson(option,cb) {
    unirest.get('http://japi.juhe.cn/trademark/search?keyword=' + option.keywork + '&pageSize=' + option.pageSize +
        '&pageNo=' + option.pageNo + '&key=' + option.key)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send()
        .end(function (response) {
            saveJson(option.keywork,response.body)
            var newResult=JSON.parse(response.body)
            if (newResult.result.data.length === option.pageSize&&option.pageNo<3) {
                option.pageNo += 1
                return  getJson(option,cb)
            }
            cb()
        })
}

function saveJson(keyword, data){
    var txt_info=readJson(keyword);
    if(txt_info==null){
        console.log(1)
        fs.appendFile('./'+keyword+'.txt',data)
    }else {
        fs.appendFile('./'+keyword+'.txt','*'+data)
    }
}

function readJson(keyword){
    var txt_file=fs.existsSync('./' + keyword + '.txt' )
    if (txt_file==true) {
        var data = fs.readFileSync('./' + keyword + '.txt')
        return data.toString()
    }else {return null}

}

getJson(option,function(){
        var info=readJson(option.keywork)
        var newImg=[]
        newImg=info.split('*')
        newImg.forEach(function (a) {
           var datainfo=JSON.parse(a)
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






















