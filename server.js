/**
 * Created by kevin on 7/12/2017.
 */
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3035,
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var tempRoutes = require('./api/routes/tmpRoutes.js');
tempRoutes(app);

var authRoutes = require('./api/routes/authRoutes.js');
authRoutes(app);

var testRoutes = require('./api/routes/testRoutes.js');
testRoutes(app);


app.listen(port);

console.log('mzs-temp-logger-service API Server started on: ', port);