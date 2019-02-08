const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const flash = require('express-flash');
const session      = require('express-session');
const passport = require('./config/passport');
const busboyBodyParser = require('busboy-body-parser');

const app = express();
const PORT = process.env.PORT || 8000;


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Smartlink',{useCreateIndex: true, useNewUrlParser: true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
(db.on('error', console.error.bind(console, 'MongoDB connection error:')));




var hbsHelpers = exphbs.create({
    helpers: require("./config/handlebars").helpers,
    defaultLayout: 'main',
    extname: '.hbs'
});

app.engine('.hbs', hbsHelpers.engine);
app.set('view engine', '.hbs');

app.use(session({
    key: process.env.KEY,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{ 
        expires: 6000000000000000,
    }
}));
app.use(flash());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(busboyBodyParser());
app.use(express.static("public"));




app.use(passport.initialize());
app.use(passport.session()); 

const indexRouter = require('./routes/index');
const filesRouter = require('./routes/awsfiles');

// routes for the app
app.use('/', indexRouter);
app.use('/mp3', filesRouter);

// set the app to listen on the port
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});