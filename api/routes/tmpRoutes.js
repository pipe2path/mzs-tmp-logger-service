/**
 * Created by kevin on 7/12/2017.
 */
'use strict';
module.exports = function(app) {
    var tmpLogger = require('../controllers/tmpController.js');


    // Routes
    app.route('/temperature')
        .get(tmpLogger.get_readings)
        .post(tmpLogger.post_readings);


};
