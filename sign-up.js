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


//sends to home page if user not logged in
//else sends to home page - home_page.handlebars
app.get('/sign-up', function (req, res, next) {
    res.render('sign_up');
    //res.sendFile('static/signup.html', { root : __dirname});   
}); 

app.post('/sign-up', function (req, res, next){
    console.log(req.body.fname);
   var signupQuery = "INSERT INTO RTD_user (f_name, l_name, email, zip, role_type_id) VALUES (\"" + req.body.fname + "\,\"" + req.body.lname + "\, \""  + req.body.email + "\, \""  + req.body.zip + "\, (SELECT id FROM RTD_role_type WHERE role_name = \""  + "constituent" + "\))";
    mysql.pool.query(signupQuery, function (err, rows) {
        if (err) return;
        
            if (rows < 1) {
                req.session.reset();
                res.send('Sorry, sign up failed');
            } 
    });
    res.render('signup_complete');
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