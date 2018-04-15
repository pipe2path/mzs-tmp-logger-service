'use strict';
module.exports = function(app) {
    var authenticator = require('../controllers/authController.js');

    // Routes
    app.route('/authenticate')
        .get(authenticator.authenticate_login);
};