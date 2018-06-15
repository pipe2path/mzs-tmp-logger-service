var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

var mongoClient = require('mongodb');

exports.get_readings = function(req, res) {

    res.setHeader('Access-Control-Allow-Origin','*');

    //GetTemperatureData(function(items) {
    res.send(items);
    //});
};

exports.post_readings = function(req, res){

    var reading = {};
    var dateTimeStamp = new Date().getTime()

    reading.data = req.body.data;
    reading.dateTimeStamp = (new Date ((new Date((new Date(new Date(dateTimeStamp))).toISOString() )).getTime() -
        ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
    postDataToDatabase(reading);

    res.send('reading posted');
}

function postDataToDatabase(reading){

    mongoClient.connect("mongodb://admin:mzslogger@ds151222.mlab.com:51222/mzs-logger", function(err, db) {
        if (err) {console.log(err)};
        var document = db.collection('testReadings');
        document.insertOne(reading);
    });
}