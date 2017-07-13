/**
 * Created by kevin on 7/12/2017.
 */
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3028,
    bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/tmpRoutes.js');
routes(app);

app.listen(port);

console.log('mzs-temp-logger-service API Server started on: ', port);