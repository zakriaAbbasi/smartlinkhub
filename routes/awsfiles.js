const express = require('express');
const router = express.Router();
const path = require('path');

const isAuthenticated = require('../config/isAuthenticated');
//const fs = require('fs');
const AWS = require('aws-sdk');
const Busboy = require('busboy');

//Route to upload file to AWS bucket
router.post('/upload', isAuthenticated,   function(req, res) { 
    const busboy = new Busboy({ headers: req.headers });
   // The file upload has completed
    busboy.on('finish', function() {
    console.log('Upload finished');
    const file = req.files.file;
    
    //upload to Aws bucket
     let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      Bucket: process.env.AWS_BUCKET
    });
    s3bucket.createBucket(function () {
      var params = {
       Bucket: process.env.AWS_BUCKET,
       Key: file.name,
       Body: file.data,
      };
      s3bucket.upload(params, function (err, data,) {
       if (err) {
       res.send(err);
       }
       res.send(data);
      });
    });
    });
req.pipe(busboy);
});

//isAuthenticated,
//Route to download file from AWS bucket
router.get('/download',    function(req, res) { 
  //access to Aws bucket
   let s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
  });
  var params = {
    Bucket: process.env.AWS_BUCKET,
    Key:'Maroon 5 - Girls Like You ft. Cardi B.mp3',
   };
  s3bucket.getObject(params, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        res.send(data.Body);
        console.log(data); 
    }

})
  });


module.exports = router;