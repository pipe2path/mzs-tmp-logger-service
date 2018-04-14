/**
 * Created by kevin on 7/12/2017.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var mongoClient = require('mongodb');
var temperature = require('../models/temperature.js');

exports.get_readings = function(req, res) {

    res.setHeader('Access-Control-Allow-Origin','*');

    GetTemperatureData(function(items) {
        res.send(items);
    });
};

exports.get_readingsById = function(req, res) {

    var id = req.params.id;
    GetTemperatureByEntity(id, function(items){
        res.send(items);
    });
};


var GetTemperatureByEntity = function(id, callback) {
    return mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function (err, db) {
        if (err) {console.log(err)};

        db.collection('temperatureReadings').find({'entityId': id})
                    .sort({dateTimeStamp: -1}).toArray(function(err, arr){
                        callback(arr);
            });
    });
};


var GetTemperatureData = function(callback){
    return mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        //var temperature = db.collection('temperatureReadings');

        db.collection('temperatureReadings').aggregate([
            { $lookup:
                {
                    from: 'entity',
                    localField: 'entityId',
                    foreignField: 'entityId',
                    as: 'temperatureDetails'
                }
            }
        ], function(err, res) {
            if (err) throw err;
            var temperatureSorted = insSortJsonArr(res, "dateTimeStamp", true);
            db.close();

            return callback(temperatureSorted);
        });
    });
};


exports.post_readings = function(req, res) {

    var entityId = req.query.entityId;
    var celsius = req.query.celsius;
    var voltage = req.query.voltage;
    var voltageOffset = 0.81;
    var trueVoltage=parseFloat(voltage).toFixed(2) + voltageOffset;

    res.setHeader('Access-Control-Allow-Origin','*');

    logger.debug('entityId: ' + entityId);
    logger.debug('celsius reading: ' + celsius );
    logger.debug('voltage reading: ' + voltage );

    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    var readingsData = new temperature({ dateTimeStamp: dateLocal,
            entityId: entityId,
            readingCelsius: celsius,
            voltage: trueVoltage });

    res.setHeader('Access-Control-Allow-Origin','*');

    mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        var temperature = db.collection('temperatureReadings');

        temperature.insertOne(readingsData);
    });
    res.send("Temperature reading added");
};

function insSortJsonArr(jsonArray, key, isGreatestToLeast){
    for(var i = 1; i < jsonArray.length; i++){
        var next = jsonArray[i];
        var j = i;
        if(isGreatestToLeast){
            while(j > 0 &&  next[key] >  jsonArray[j - 1][key]){
                jsonArray[j] = jsonArray[j - 1];
                j--;
            }
        } else{
            while(j > 0 &&  jsonArray[j - 1][key] < next[key]){
                jsonArray[j] = jsonArray[j - 1];
                j--;
            }
        }
        jsonArray[j] = next;
    }
    return jsonArray;
}