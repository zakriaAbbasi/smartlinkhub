const express = require('express');
const router = express.Router();
const path = require('path');
//Middleware to connect to database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Smartlink',{ useNewUrlParser: true,useCreateIndex: true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
(db.on('error', console.error.bind(console, 'MongoDB connection error:')));

const passport = require('../config/passport');
const usermodel = require('../models/user');
const isAuthenticated = require('../config/isAuthenticated');



router.get('/', function(req, res, next){
  res.render('index', { title: 'Welcome to my music app' });
});

router.post('/signup', function(req, res ){
  if (!req.body.email || !req.body.password || !req.body.name || !req.body.type) {
    res.json({success: false, msg: 'Please provide all the credentials'});
  } else {
    var newUser = new usermodel({
      username:req.body.name, email: req.body.email, password: req.body.password,
      usertype: req.body.type
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'This email has already been registered.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
      
    });
  }
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err,user, info) {
    if( user == false) {res.json(info.message)}
    else{
      req.logIn(user, function (err) {
      if (err) { return next(err); }
      return res.send(req.user);
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