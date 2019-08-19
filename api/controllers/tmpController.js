/**
 * Created by kevin on 7/12/2017.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var mongoClient = require('mongodb');
var temperature = require('../models/temperature.js');
var settings = require('../common/settings.js');
var entityObj = require('../models/entity.js');
var sinchSms = require('sinch-sms');
var async = require('async');
var entity;
var smsSettings;
var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
    ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');


exports.get_readings = function(req, res) {

    res.setHeader('Access-Control-Allow-Origin','*');

    GetTemperatureData(function(items) {
        res.send(items);
    });
};

exports.get_readingsById = function(req, res) {

    res.setHeader('Access-Control-Allow-Origin','*');

    var id = parseInt(req.params.id);
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
        ],function(err, res) {
            if (err) throw err;
            var temperatureSorted = insSortJsonArr(res, "dateTimeStamp", true);
            db.close();

            return callback(temperatureSorted);
        }).cursor({});
    });
};

exports.post_readings_new = function(req, res) {

    var data = req.body;
    logger.debug('body: ' + data);

    var readings = prepareDataToPost(data)
    postDataToDatabase(readings);

    res.setHeader('Access-Control-Allow-Origin','*');

    res.send("Temperature reading added");
};

function checkAndProcessAlert(entityId, celsius){

    var entityItems = undefined;

    // get entity temperature settings for the id
    var entityPromise = getEntity(entityId);

    entityPromise.then(function(result){
        entityItems = result;
        console.log(entityItems);
        entity = new entityObj({
            entityId: entityId,
            alertPhone: entityItems[0].alertPhone,
            alertMsg: entityItems[0].alertMsg,
            alertTemp: entityItems[0].alertTemp,
            alertFlag: entityItems[0].alertFlag,
            alertSMSLastSent: entityItems[0].alertSMSLastSent
        })

        var alertLastSentConverted = (entity.alertSMSLastSent == '' ? new Date().getTime(): Date.parse(entity.alertSMSLastSent));
        var dateNow = new Date().getTime();
        var alertSMSTimeDiff = Math.abs(dateNow - alertLastSentConverted) / (60*60*1000);

        // if alert flag is true and temperature is higher than what it should be and it's been 24 hours since the last alert
        if (entity.alertFlag == "true" && celsius > entity.alertTemp && alertSMSTimeDiff >= 24){
            processAlert(entityId, celsius, dateLocal);
        }
        return false;
    });

}

function getEntity(entityId){
    return new Promise(function(resolve, reject) {
        mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function (err, db) {
            if (err) {
                console.log(err)
                reject(err);
            };

            db.collection('entity').find({'entityId': entityId}).toArray(function (err, arr) {
                resolve(arr);
            });
        });
    });
}

var getSettings = function(callback){
    var result;
    return new Promise(function(resolve, reject) {
        mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function (err, db) {
            if (err) {
                console.log(err)
                reject(err);
            };
            result = db.collection('configSettings').find().toArray(function (err, arr) {
                resolve(arr)
            });
        });
    })
}

function processAlert(entityId, celsius, dateRecorded){

    var settingsPromise = getSettings();
    settingsPromise.then(function(result){
        var items = result;
        smsSettings = new settings({
            configSettingsId: items[0].configSettingsId,
            sinchKey: items[0].sinchKey,
            sinchPwd: items[0].sinchPwd
        });

         sinchSms = require('sinch-sms')({
            key: smsSettings.sinchKey,
            secret: smsSettings.sinchPwd
         });

         var smsMsg = entity.alertMsg + '  ' + celsius + ' recorded at ' + dateRecorded;
         sinchSms.send(entity.alertPhone, smsMsg ).then(function (response) {
            console.log('sinch sms response: ' + response.messageId);
            }).fail(function (error) {
                console.log('sinch sms error: ' + error);
            });

        // update database with latest alert timestamp
        mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
            if (err) {console.log(err)};
            db.collection("entity").updateOne(
            { entityId: entityId},
            {
                $set: { "alertSMSLastSent" : dateLocal}
            })
        });
    });
}

function postDataToDatabase(readings){
    mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        var temperature = db.collection('temperatureReadings');
        temperature.insertMany(readings);
    });
}

function prepareDataToPost(data){
    var entityId ;
    var voltageOffset = 0.81;
    var trueVoltage ;
    var celsius ;
    var dateTimeStamp;
    var recordedTime;
    var timeOffset = 10;
    var j = 1;


    var readings = [];
    for(var i=data.length-1; i>=0; i--){
        j++;
        entityId = data[i].entityId;
        celsius = data[i].tempinC;
        trueVoltage=parseFloat(data[i].voltage).toFixed(2) + voltageOffset;
        dateTimeStamp = new Date().getTime() - (j*timeOffset*3600000);
        recordedTime = (new Date ((new Date((new Date(new Date(dateTimeStamp))).toISOString() )).getTime() -
<<<<<<< HEAD
            ((new Date()).getTimezoneOffset()*3600000))).toISOString().slice(0, 19).replace('T', ' ');
=======
            ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
        recordedTime = recordedTime;
>>>>>>> bf564d4ff9e041e2f6dceb5fa6411a74b8b5d610

        var reading = new temperature({
            dateTimeStamp: recordedTime,
            entityId: entityId,
            readingCelsius: celsius,
            voltage: trueVoltage
        });
        readings.push(reading);

        checkAndProcessAlert (entityId, celsius);
    }
    return readings;
}

exports.post_hightemp_alert = function(req, res){

    var data = req.body;
    logger.debug('body:' + data);

    res.send ("High Temperature alert posted")
}


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

<<<<<<< HEAD
    var dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*3600000))).toISOString().slice(0, 19).replace('T', ' ');
=======
    //dateLocal = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() -
    //    ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
>>>>>>> bf564d4ff9e041e2f6dceb5fa6411a74b8b5d610
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

function convertTimestamp(timestamp) {
    var d = new Date(timestamp),	// Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
}