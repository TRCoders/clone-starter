module.exports = function(app, passport, db, multer, ObjectId) {

 // Image Upload Code =========================================================================
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
});
var upload = multer({storage: storage}); 

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('posts').find({postedBy: req.user._id}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            posts: result
          })
        })
    });
    //feed page
    app.get('/feed', function(req, res) {
      db.collection('posts').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('feed.ejs', {
          posts: result
        })
      })
  });
  //post page
  app.get('/post/:lion', isLoggedIn, function(req, res) {
    let postId = ObjectId(req.params.lion)
    console.log(postId)
    db.collection('posts').find({_id: postId}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('post.ejs', {
        posts: result
      })
    })
});
//profile page
app.get('/page/:id', isLoggedIn, function(req, res) {
  let postId = ObjectId(req.params.id)
  db.collection('posts').find({postedBy: postId}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('page.ejs', {
      posts: result
    })
  })
});

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
// post routes
app.post('/makePost', upload.single('file-to-upload'), (req, res) => {
  let user = req.user._id
  db.collection('posts').save({caption: req.body.caption, img: 'images/uploads/' + req.file.filename, postedBy: user, postLikes: 0, userComments: []}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
})


// message board routes ===============================================================

    app.put('/feed', (req, res) => {
      let userId = ObjectId(req.body.userId)
      db.collection('userposts').findOneAndUpdate({_id: userId}, {
        $set: {
          postLikes: req.body.postLikes + 1
        }
      }, {
        sort: {_id: -1},
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/usercomments', (req, res) => {
      let userPostId = ObjectId(req.body.userPostId)
      db.collection('userposts')
      .findOneAndUpdate({_id: userPostId}, {
        $push: {
          userComments:req.body.userComments
        }
      }, {
        sort: {_id: -1},
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/feed', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        let user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
