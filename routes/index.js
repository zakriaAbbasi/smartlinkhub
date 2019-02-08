const express = require('express');
const router = express.Router();
const passport = require('../config/passport');



const usermodel = require('../models/user');
const songModel = require('../models/songs');
const isAuthenticated = require('../config/isAuthenticated');



router.get('/', function(req, res, next){
  var us = req.user;
  songModel.find().then(latest => {
    latest= latest.reverse();    
    console.log(latest);
    if(!us){res.render('index', {user: null, text: 'Login' , latestSongs: latest});}
    else{res.render('index', {user: us.username, text: 'Signed in as: '+us.username, latestSongs: latest});}       
  }).catch(err => {
    req.flash('info', 'Error Fetching data from server');
    res.redirect('/');
      });
});

router.get('/login', function(req, res, next){
  res.render('login', {layout: 'abc'} );
});
router.get('/admin' ,isAuthenticated, function(req, res, next){
  res.render('admin' , {layout: 'admin'});
});

router.get('/signup', function(req, res, next){
  res.render('signup', {layout: 'abc'});
});

router.get('/uploadfile', isAuthenticated,  function(req, res, next){
  res.render('uploadfile', {layout: 'abc'});
});

router.post('/signup', function(req, res ){
  if (!req.body.email || !req.body.password || !req.body.name || !req.body.type) {
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/signup');
  }
   else {
    var newUser = new usermodel({
      username:req.body.name, email: req.body.email, password: req.body.password,
      usertype: req.body.type
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        //console.log(err);
        req.flash('info', 'This email has already been used');
        res.redirect('/signup');
      }
      else{
      req.flash('info', 'Success');
      res.redirect('/login');
      }
    });
  }
});

router.post('/login', function(req, res, next) {
  if(req.body.email == 'admin@dmt.com' && req.body.password == 'dmt'){
    var user ={ username: 'admin'};
    req.logIn(user, function (err) {
      if (err) { req.flash('info', 'Error logging in');
      res.redirect('/login'); }
      else{
        res.redirect('/admin');
      }
  });
}
else{
  passport.authenticate('local', function(err,user, info) {
    if( user == false)
    {
      req.flash('info', info.message);
      res.redirect('/login');
   }
    else{
      req.logIn(user, function (err) {
      if (err) { req.flash('info', 'Error logging in');
      res.redirect('/login'); }
      else{
        res.redirect('/');
      }
  });
};
})
  (req, res, next);
}
});

//isAuthenticated,
router.post('/members', isAuthenticated,  function(req, res) {
  res.send('Authenticated members page'); 
});

module.exports = router;