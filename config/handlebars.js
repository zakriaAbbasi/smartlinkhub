const express = require('express');
const AWS = require('aws-sdk');

var register = function (Handlebars) {
    var helpers = {
        userinfo: function (req) {
            if (!req.user) { return 'Login' }
            else { return 'Signed in as:' + req.user.email };

        },
        ifuser: function (req) {
            console.log('hereiis');
            if (req.user) { console.log('true') };
            return (req.user) ? options.fn(this) : options.inverse(this);
        },
        stream: function (file) {
            //"/mp3images/Dilri Lutti.mp3"
            console.log(file);
            console.log("/mp3images/" + file);
            //return "/mp3images/"+file;
            streamFile(file);
        }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        return helpers;
    }
};

function streamFile(key) {
    console.log('nowwww', key);
    //access to Aws bucket
    let s3bucket = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        Bucket: process.env.AWS_BUCKET
    });
    var params = {
        Bucket: process.env.AWS_BUCKET,
        Key: 'Dilri Lutti.mp3',
    };
    var stream = s3bucket.getObject(params).createReadStream();
    // forward errors
    stream.on('error', function error(err) {
        console.log('error streaming this song ', err);
    });
    stream.on('end', () => {
        console.log('Served by Amazon S3: ' + params.Key);
    });
    //Pipe the s3 object to the response
    return stream.pipe();
}

module.exports.register = register;
module.exports.helpers = register(null); 