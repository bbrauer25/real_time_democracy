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

app.set('port', 3002);
app.use(express.static('static')); //static pages for testing
app.use(sessions({
    cookieName: 'session',
    secret: 'my_super_secret_string',
    duration: 5 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

// basic signup page when the user hits the submit button, POST is sent
app.get('/sign-up', function (req, res, next) {
    res.render('sign_up');
});

// POST request is sent to DB, the user info is entered
app.post('/sign-up', function (req, res, next) {
    // this is printing to the console with correct information
    console.log(req.body.fname);
    console.log(req.body.user);

    // conditional, to check what user_type has been selected from dropdown menu
    if (req.body.user === "constituent") {
        var signupQuery = "INSERT INTO RTD_user (f_name, l_name, email, zip, role_type_id) VALUES ('" + req.body.fname +
        "','" + req.body.lname + "', '" + req.body.email + "', '" + req.body.zip + "', (SELECT id FROM RTD_role_type WHERE role_name = '" + "constituent" + "'))";
        console.log(signupQuery);
        mysql.pool.query(signupQuery, function (err, rows) {
            if (err) {
                next(err);
                return;
            }
            if (rows < 1) {
                req.session.reset();
                res.send('Sorry, sign up failed');
            }
        });
    }

    // conditional, to check what user_type has been selected from dropdown menu
    if (req.body.user === "official") {
        var signupQuery = "INSERT INTO RTD_user (f_name, l_name, email, zip, role_type_id) VALUES ('" + req.body.fname + "','" + req.body.lname + "', '" + req.body.email + "', '" + req.body.zip + "', (SELECT id FROM RTD_role_type WHERE role_name = '" + "elected" + "'))";
        mysql.pool.query(signupQuery, function (err, rows) {
            if (err) return;

            if (rows < 1) {
                req.session.reset();
                res.send('Sorry, sign up failed');
            }
        });
    }

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
