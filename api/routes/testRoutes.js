module.exports = function(app) {
    var testService = require('../controllers/testController.js');

    // Routes
    app.route('/test')
        .get(testService.get_readings)
        .post(testService.post_readings);
};