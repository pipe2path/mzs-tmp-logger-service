/**
 * Created by kevin on 7/12/2017.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var mongoClient = require('mongodb');

exports.get_entities = function(req, res){

    res.setHeader('Access-Control-Allow-Origin','*');

    GetEntityData(function(items) {
        res.send(items);
    });
}

var GetEntityData = function(callback){
    return mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function (err, db) {
        if (err) {console.log(err)};

        db.collection('entity').find({}).toArray(function(err, arr){
            callback(arr);
        });
    });
}