//we import passport packages required for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var bcrypt = require('bcrypt-nodejs');


//Middleware to connect to database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Smartlink',{ useNewUrlParser: true,useCreateIndex: true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
(db.on('error', console.error.bind(console, 'MongoDB connection error:')));



//We will need the models folder to check passport agains
const user_instance = require("../models/user");
//
// Telling passport we want to use a Local Strategy. In other words,
//we want login with a username/email and password
passport.use(new LocalStrategy(
  // Our user will sign in using an email, rather than a "username"
  {
    usernameField: "email"
  },
  function(email, password, done) {
    // When a user tries to sign in this code runs
    user_instance.findOne({
        email: email
    }).then(function(dbUser) {
      // If there's no user with the given email
      if (dbUser == null) {
         return done(null,false, {message: "Incorrect email."});
      }
      // If there is a user with the given email, but the password the user gives us is incorrect
      else if (dbUser != null){
      bcrypt.compare(password, dbUser.password, function(err, isMatch) {
        // Password did not match
        if (!isMatch) {return done(null,false, {message:'invalid Password'}); }  
        else {return done(null, dbUser)
        }
    });
  }
      // If none of the above, return the user
    });
  }
));
//
// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// Just consider this part boilerplate needed to make it all work
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
//
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
//
// Exporting our configured passport
module.exports = passport;