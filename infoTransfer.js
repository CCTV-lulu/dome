/**
 * Created by lulu on 17-6-5.
 */
var http=require('http')
var express = require('express')
var fs=require('fs')
var unirest = require('unirest')
var info = require('./info.json')
var img = info.result.data[0].tmImg
var lastimg = 'http://pic.tmkoo.com/pic.php?zch=' + img
function test(cb) {
    unirest.get('lastimg')
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .send({"parameter": 23, "foo": "bar"})
        .end(function (response) {
            cb((response.body))
        });
}
var hh=function(data){
    console.log(data)
}
test(hh)
var haha = function (data) {
    fs.writeFile("out.jpg", data,function (err) {
        if(err){
            console.log(err)
        }
    })
}
test(haha)
var hehe = function (data) {
    fs.writeFile("out.txt", data,function (err) {
        if(err){
            console.log(err)
        }
    })
}
test(hehe)

