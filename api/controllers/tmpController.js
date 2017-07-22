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

    GetTemperatureData(function(items){
        res.send(items);
    });
};

var GetTemperatureData = function(callback){
    return mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        var temperature = db.collection('temperatureReadings');
        temperature.find().sort({dateTimeStamp:-1}).limit(10).toArray(function(err, items){
            return callback(items);
        });
    });
};


exports.post_readings = function(req, res) {

    var entityId = req.query.entityId;
    var celsius = req.query.celsius;

    res.setHeader('Access-Control-Allow-Origin','*');

    logger.debug('entityId: ' + entityId);
    logger.debug('celsius reading: ' + celsius );

    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    var readingsData = new temperature({   dateTimeStamp: dateLocal,
        entityId: entityId,
        readingCelsius: celsius});

    res.setHeader('Access-Control-Allow-Origin','*');

    mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        var temperature = db.collection('temperatureReadings');

        temperature.insertOne(readingsData);
    });
    res.send("Temperature reading added");
};