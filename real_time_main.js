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

app.set('port', 3001);
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
    var issueQuery = "SELECT title, id, issue FROM RTD_issue;";
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
          issue_title: rows[0].title,
          issue_id: rows[0].id
        };
        for (var i = 0; i < rows.length; i++) {

          var myArticle = "<article class=\"issue\"><h3>" + rows[i].title + "</h3><p>" + rows[i].issue + "</p>";
          myArticle += "<form class=\"view-issue\" action=\"/viewDetail\" method=\"post\"><input type=\"submit\" value=\"View Issue Detail\" class=\"view-issue-button\">";
          myArticle += "<input class=\"issue\" name=\"issue_id\" type=\"hidden\" value=" + rows[i].id + "></form></article>";
          issueArray.push(myArticle);
        };
        data.issue = issueArray;
        res.render('home_page', data);
      }
    });
  } else {  //serve home.html if not
    res.sendFile('static/home.html', { root : __dirname});
  }
});

app.post('/viewDetail', function(req, res) {
  //expects issue_id to be posted as a body parameter
  var viewDetailQuery = "SELECT id, title, issue FROM RTD_issue WHERE id =" + req.body.issue_id + ";";
  console.log(viewDetailQuery);
  
  //screen to see if comment_text is set and add to database if sort
  if (req.body.comment_text) {
    var commentInsertQuery = "INSERT INTO RTD_issue_comment(user_id, issue_id, comment) VALUES(";
    commentInsertQuery += req.session.user_id + "," + req.body.issue_id + ",\"" + req.body.comment_text + "\");";
    console.log(commentInsertQuery);
    mysql.pool.query(commentInsertQuery, function (err, results) {
      if (err) return;
      console.log("successfully added comment");
    });
  }
  
  mysql.pool.query(viewDetailQuery, function (err, rows) {
    if (err) return;
    if (rows < 1) {
      res.send("no issue found in database");
    } else {
      var commentsArray = [];
      var data = {
        issue_title: rows[0].title,
        issue_description: rows[0].issue,
        issue_upvotes: 0,
        issue_id: req.body.issue_id,
        comments: []
      };
      currentUpvotesQuery = "SELECT * FROM RTD_issue_upvote WHERE issue_id = " + req.body.issue_id + ";";
      mysql.pool.query(currentUpvotesQuery, function (err, rows) {
        data.issue_upvotes = rows.length;
        //get comments 
        commentsQuery = "SELECT comment FROM RTD_issue_comment WHERE issue_id = " + req.body.issue_id + ";";
        console.log(commentsQuery);
        mysql.pool.query(commentsQuery, function (err, rows) {
          if (err) return;
          if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
              var myComment = "<p>" + rows[i].comment + "</p>";
              commentsArray.push(myComment);
            }
            data.comments = commentsArray;
            res.render('viewDetail', data);
          } else {
            res.render('viewDetail', data);
          }
        });
      });
    }
  });
});

app.post('/sendUpvote', function(req, res) {
  var userID = req.session.user_id;
  //first send the vote
  var sendUpvoteQuery = "INSERT INTO RTD_issue_upvote(user_id, issue_id, upvote) VALUES(";
  sendUpvoteQuery += userID + "," + req.body.issue_id + ",\"1\");";
  mysql.pool.query(sendUpvoteQuery, function (err, result) {
    if (err) return;
    currentUpvotesQuery = "SELECT * FROM RTD_issue_upvote WHERE issue_id = " + req.body.issue_id + ";";
    mysql.pool.query(currentUpvotesQuery, function (err, rows) {
      if (err) return;
      res.send("Upvotes: " + rows.length);
    });
  });
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
      var userID = rows[0].id;
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
          req.session.user_id = userID;
          var issueQuery = "SELECT title, id, issue FROM RTD_issue;";
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
                  issue_title: rows[0].title,
                  issue_id: rows[0].id
                };
                for (var i = 0; i < rows.length; i++) {
                  var myArticle = "<article class=\"issue\"><h3>" + rows[i].title + "</h3><p>" + rows[i].issue + "</p>";
                  myArticle += "<form class=\"view-issue\" action=\"/viewDetail\" method=\"post\"><input type=\"submit\" value=\"View Issue Detail\" class=\"view-issue-button\">";
                  myArticle += "<input class=\"issue\" name=\"issue_id\" type=\"hidden\" value=" + rows[i].id + "></form></article>";
                  issueArray.push(myArticle);
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

// basic signup page when the user hits the submit button, POST is sent
app.get('/sign-up', function (req, res, next) {
    res.render('sign_up');
});

// POST request is sent to DB, the user info is entered
app.post('/sign-up', function (req, res, next) {
    // this is printing to the console with correct information
    console.log(req.body.fname);
    console.log(req.body.user);

    if (req.body.user === "official") {
      var queryType = "elected"
    }
    else{
      var queryType = req.body.user
    }

    // The query is the same for constituents or elected officials, only the queryType changes
    var signupQuery = "INSERT INTO RTD_user (f_name, l_name, email, zip, role_type_id) VALUES ('" + req.body.fname + "','" + req.body.lname + "', '" + req.body.email + "', '" + req.body.zip + "', (SELECT id FROM RTD_role_type WHERE role_name = '" + queryType + "'))";
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

      // Render issues
      var issueQuery = "SELECT title, id, issue FROM RTD_issue;";
      mysql.pool.query(issueQuery, function (err, rows) {
        if (err) {
          next(err);
          return;
        }
        var issueArray = [];
        if (rows.length > 0) {
          console.log(rows[0]);
          var data = {
            username: req.body.email,
            issue_description: rows[0].issue,
            issue_title: rows[0].title,
            issue_id: rows[0].id
          };
          for (var i = 0; i < rows.length; i++) {
            var myArticle = "<article class=\"issue\"><h3>" + rows[i].title + "</h3><p>" + rows[i].issue + "</p>";
            myArticle += "<form class=\"view-issue\" action=\"/viewDetail\" method=\"post\"><input type=\"submit\" value=\"View Issue Detail\" class=\"view-issue-button\">";
            myArticle += "<input class=\"issue\" name=\"issue_id\" type=\"hidden\" value=" + rows[i].id + "></form></article>";
            issueArray.push(myArticle);
          };
          data.issue = issueArray;
          res.render('home_page', data);
        }
      });
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


