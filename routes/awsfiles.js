const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/isAuthenticated');
const songsModel = require('../models/songs');
const AWS = require('aws-sdk');
var filemanager = require('easy-file-manager')

      //isAuthenticated,
//Route to upload file to AWS bucket
router.post('/upload', function(req, res)  {
   if(!req.files.file1 || !req.files.file2 || !req.body.artist){
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/uploadfile');
   }
   else
   {
   console.log(req.files);
   console.log(req.body);
  filemanager.upload('/public/mp3images',req.files.file2.name,req.files.file2.data,function(err){
     if(err){
      req.flash('info', 'cannot upload image');
      res.redirect('/uploadfile');
     }
  });
      var mp3 = new songsModel({fileName:req.files.file1.name,
      avatar: req.files.file2.name,
      artist: req.body.artist,
    });
    mp3.save(); 

    const mp3file = req.files.file1; 
    //upload to Aws bucket
     let s3bucket = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      Bucket: process.env.AWS_BUCKET
    });
    s3bucket.createBucket(function () {
      var params = {
       Bucket: process.env.AWS_BUCKET,
       Key: mp3file.name,
       Body: mp3file.data,
      };
      s3bucket.upload(params, function (err, data,) {
        if (err) {
        req.flash('info', 'cannot upload song');
        res.redirect('/uploadfile');
       }
       else{
        req.flash('info', 'Upload successfull');
        res.redirect('/uploadfile');
       }
      });
    });
  }
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