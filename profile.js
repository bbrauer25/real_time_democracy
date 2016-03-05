var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('./db_connection.js');
var app = express();
var handlebars = require('express-handlebars');
var sessions = require('client-sessions');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.set('port', 3000);
app.use(express.static('static')); //static pages for testing
 app.use(sessions({
  cookieName: 'session',
  secret: 'my_super_secret_string',
  duration: 5 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
})); 

// this is just a basic set up of the profile page, no data from the DB is connected
// I am not sure where the bio, user since, etc data is in the DB
app.get('/profile', function (req, res, next) {
    res.render('profile');
    //res.sendFile('static/profile.html', { root : __dirname});   
}); 

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    var context = {};
    context.errCode = '';
    res.status(500);
    res.render('500', context);
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});