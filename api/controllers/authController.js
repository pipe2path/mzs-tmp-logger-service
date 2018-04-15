

exports.authenticate_login = function(req, res){

    res.setHeader('Access-Control-Allow-Origin','*');

    var username= req.query.username;
    var password = req.query.password;

    if (username == 'kevin' && password == '1234')
        res.send(true);
}