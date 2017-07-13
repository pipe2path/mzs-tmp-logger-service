/**
 * Created by kevin on 7/12/2017.
 */
'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'debug';

exports.get_readings = function(req, res) {
    res.send('reached GET')
};

exports.post_readings = function(req, res) {

    logger.debug('entityId: ' + req.query.entityId);
    logger.debug('celsius reading: ', req.query.celsius);

    res.send('reached POST')
};