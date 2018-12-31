const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const uuid = require('uuid/v4')
require('dotenv').config();
const exphbs = require('express-handlebars');
const session      = require('express-session');
const passport = require('./config/passport');
const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');

const app = express();
const PORT = process.env.PORT;
var flash = require('connect-flash');
var hbsHelpers = exphbs.create({
    helpers: require("./config/handlebars").helpers,
    defaultLayout: 'main',
    extname: '.hbs'
});

app.engine('.hbs', hbsHelpers.engine);
app.set('view engine', '.hbs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(busboyBodyParser());
app.use(express.static("public"));
app.use(busboy());

app.use(session({
    key: process.env.KEY,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{ 
        expires: 6000000000000000,
    }
}));



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