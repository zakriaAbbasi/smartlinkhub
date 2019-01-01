const express = require('express');
const router = express.Router();
const path = require('path');
//Middleware to connect to database
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/Smartlink',{ useNewUrlParser: true,useCreateIndex: true});
// // Get Mongoose to use the global promise library
// mongoose.Promise = global.Promise;
// //Get the default connection
// const db = mongoose.connection;
// //Bind connection to error event (to get notification of connection errors)
// (db.on('error', console.error.bind(console, 'MongoDB connection error:')));

const passport = require('../config/passport');
const usermodel = require('../models/user');
const isAuthenticated = require('../config/isAuthenticated');



router.get('/', function(req, res, next){
  var us = req.user;
  console.log(us);
  if(!us){res.render('index', {user: null, text: 'Login'});}
  else{res.render('index', {user: us.username, text: 'Signed in as: '+us.username});}
});

router.get('/login', function(req, res, next){
  res.render('login', {layout: 'abc'} );
});
router.get('/test', function(req, res, next){
  res.render('admin');
});

router.get('/signup', function(req, res, next){
  res.render('signup', {layout: 'abc'});
});


router.post('/signup', function(req, res ){
  console.log(req.body);
  if (!req.body.email || !req.body.password || !req.body.name || !req.body.type) {
    res.render('signup', { messages: req.flash('please provide all the credentials') });
  } else {
    var newUser = new usermodel({
      username:req.body.name, email: req.body.email, password: req.body.password,
      usertype: req.body.type
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        res.render('signup', { messages: req.flash('This email has already been used') });
      }
      res.render('home', { messages: req.flash('succesfully created new user') });
      
    });
  }
});

router.post('/login', function(req, res, next) {
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
});

//isAuthenticated,
router.post('/members', isAuthenticated,  function(req, res) {
  res.send('Authenticated members page'); 
});

module.exports = router;