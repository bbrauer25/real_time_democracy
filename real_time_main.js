var express = require('express');
var bodyParser = require('body-parser');
//var mysql = require('./db_connection.js');

var app = express();
var handlebars = require('express-handlebars');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('static')); //static pages for testing

app.get('/', function (req, res, next) {
  res.sendFile('static/home.html', { root : __dirname});
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    var context = {};
    context.errCode = 'Cannot deposit/withdraw/transfer money to/from an account that doesn\'t exist';
    res.status(500);
    res.render('500', context);
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

