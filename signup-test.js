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
app.set('port', 3001);
app.use(express.static('static')); //static pages for testing
 app.use(sessions({
  cookieName: 'session',
  secret: 'my_super_secret_string',
  duration: 5 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
})); 

// test will run when Test button is hit
app.get('/signup-test', function (req, res, next) {
    res.render('signup_test');
});

app.post('/signup-test', function (req, res, next) {
    // select everything to see if data is submiting/entering
    var testQuery = "SELECT * FROM RTD_user;";
            mysql.pool.query(testQuery, function (err, rows) {
            if (err) {
              next(err);
              return;
            }
            if (rows.length > 0) {
              console.log(rows[rows.length - 1]);
              res.render('signup_test_results');
            }
		else 
		 res.render('signup_test_results')
          });
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