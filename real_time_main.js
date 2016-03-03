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
app.get('/', function (req, res, next) {
  //screen for whether user is logged in
  if (req.session && req.session.username) { //user based home landing page
    var issueQuery = "SELECT title, issue FROM RTD_issue;";
    mysql.pool.query(issueQuery, function (err, rows) {
      if (err) {
        next(err);
        return;
      }
      var issueArray = [];
      if (rows.length > 0) {
        console.log(rows[0]);
        var data = {
          username: req.session.username,
          issue_description: rows[0].issue,
          issue_title: rows[0].title
        };
        for (var i = 0; i < rows.length; i++) {
          issueArray.push("<h1>" + rows[i].title + "</h1><p>" + rows[i].issue + "</p>");
        };
        data.issue = issueArray;
        res.render('home_page', data);
      }
  
      /*if (rows.length > 0) {
        console.log(rows[0]);
        var data = {
          username: req.session.username,
          issue_description: rows[0].issue,
          issue_title: rows[0].title
        };
        res.render('home_page', data);
      } else {
          var data = {username: req.session.username};
          res.render('home_page', data)
      }*/
    });
  } else {  //serve home.html if not
    res.sendFile('static/home.html', { root : __dirname});
  }
});

app.post('/logout', function(req, res) {
  if (req.session) {
    req.session.reset(); 
  }
  res.sendFile('static/home.html', { root : __dirname});
});

//handles login post from header on home page
app.post('/login', function (req, res, next) {
  var loginQuery = "SELECT id FROM RTD_user WHERE email = \"" + req.body.username + "\";";
  mysql.pool.query(loginQuery, function (err, rows) {
    if (err) return;
    if (rows < 1) {
          if (req.session) {
            req.session.reset();
          }
      res.send('Sorry, credentials are invalid');
    } else {
      //now check for password
      var passwordQuery = "SELECT id FROM RTD_password WHERE user_id = " + rows[0].id;
      passwordQuery += " AND password = \"" + req.body.password + "\";";
      mysql.pool.query(passwordQuery, function (err, rows) {
        if (err) return;
        if (rows < 1) {
          req.session.reset();
          res.send('Sorry, credentials are invalid');
        } else {
          //login here - direct to landing page!
          if (req.session) {
            req.session.reset();
          }
          req.session.username = req.body.username;
          var issueQuery = "SELECT title, issue FROM RTD_issue;";
          mysql.pool.query(issueQuery, function (err, rows) {
            if (err) {
              next(err);
              return;
            }
            if (rows.length > 0) {
              console.log(rows[0]);
              var issueArray = [];
              if (rows.length > 0) {
                console.log(rows[0]);
                var data = {
                  username: req.session.username,
                  issue_description: rows[0].issue,
                  issue_title: rows[0].title
                };
                for (var i = 0; i < rows.length; i++) {
                  issueArray.push("<h1>" + rows[i].title + "</h1><p>" + rows[i].issue + "</p>");
                };
                data.issue = issueArray;
                res.render('home_page', data);
              }
            } else {
                var data = {username: req.session.username};
                res.render('home_page', data)
            }
          });
        }
      });
    }
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

