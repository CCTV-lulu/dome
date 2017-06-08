
var http=require('http')
var express = require('express')
var fs=require('fs')
var unirest = require('unirest')

var Stream = require('stream').Transform

// var lastimg='http://pic.tmkoo.com/pic.php?zch='+info.result.data[0].tmImg


function getjson(cd) {
     unirest.get('http://japi.juhe.cn/trademark/search?keyword=1&pageSize=10&pageNo=1&key=ccc84a508ad6b49e52ba0618b8fc2e34')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send()
        .end(function (response) {
           cd(response.body)
        })
}

var json=function (info) {
    console.log(JSON.parse(info))
   var img=(JSON.parse(info)).result.data
    console.log(img)
   img.forEach(function (k){
        var lastimg = 'http://pic.tmkoo.com/pic.php?zch=' + k.tmImg

        http.request(lastimg, function(response) {
            var imginfo = new Stream();

            response.on('imginfo', function(chunk) {
            imginfo.push(chunk)
            })

            response.on('end', function() {
                fs.writeFile(k.tmImg+'.png', imginfo.read())
                })

        }).end()
    })
}
getjson(json)


























