/**
 * Created by kevin on 7/12/2017.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var mongoClient = require('mongodb');
var entities = [];

exports.get_entities = function(req, res){

    res.setHeader('Access-Control-Allow-Origin','*');

    GetEntityData(function(items) {
        entities = items;
        res.send(items);
    });
}

var GetEntityData = function(callback){
    return mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function (err, db) {
        if (err) {console.log(err)};

        var entityId = 0;
        var entities=[];
        db.collection('entity').find({}).sort({entityId: 1}).toArray(function(err, arr){
            for(var i=0;i<=arr.length-1;i++){
                entityId = parseInt(arr[i].entityId);
                entities.push({entityId: entityId, name: arr[i].name});
            }
            entities = entities.sort(GetSortOrder("entityId"));
            callback(entities);
        });
    });
}

//sort by entityId
function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}