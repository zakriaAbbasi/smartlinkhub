const express = require('express');
const router = express.Router();
const songsModel = require('../models/songs');
const AWS = require('aws-sdk');
var filemanager = require('easy-file-manager');
const path = require("path");

router.post('/upload', function(req, res)  {
  if(!req.files.file1 || !req.files.file2 || !req.body.artist){
   req.flash('info', 'Please Provide all the credentials');
   res.redirect('/uploadfile');
  }
  else
  {
    AwsImage(req.files.file2, (err, data)=>{
      if(err=== true){
       req.flash('info', 'cannot upload song, Please try again later :(');
       res.redirect('/uploadfile');
      }
      else{
        req.body.imgurl = data;
        AwsMp3(req.files.file1, (err, data)=>{
         if(err=== true){
           req.flash('info', 'cannot upload song, Please try again later :(');
           res.redirect('/uploadfile');
          }
          else{
            filemanager.upload('/public/src/images/artist',req.files.file2.name,req.files.file2.data,function(err){
              if(err){
               req.flash('info', 'cannot upload image');
               res.redirect('/uploadfile');
              }
           });
           var mp3 = new songsModel({fileName:req.files.file1.name,
                   avatar: req.body.imgurl,
                   artist: req.body.artist,
                   cover: path.parse(req.files.file1.name).name,
                   uploadedby: req.body.uploadedby,
                   timesPlayed: 0,
                   category: 'recent',
                 });
                 mp3.save(err=>{
                   if(err){
                     req.flash('info', 'cannot upload song, Please try again later :(');
                     res.redirect('/uploadfile');
                    }    
                    else{
                     req.flash('info', 'Successfully uploaded');
                     res.redirect('/uploadfile');
                    }    
                 });
          }     
        });
      }
    })     
  }
});
  
//Route to download file from AWS bucket
router.get('/download',function(req, res) { 
  songsModel.findOneAndUpdate({'fileName':req.query.id}, {$inc : {timesPlayed:1}},{useFindAndModify: false}, (err)=>{
     if(err){console.log('Error updating song')}
   })
  let s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
  });
  var params = {
    Bucket: process.env.AWS_BUCKET,
    Key: req.query.id,
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
  stream.pipe(res);
});

function AwsImage(file, callback){
  let s3bucket = new AWS.S3({
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          Bucket: process.env.AWS_IMAGES
        });
        s3bucket.createBucket(function () {
          var params = {
            Bucket: process.env.AWS_IMAGES,
            Key: file.name,
            Body: file.data,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            ACL: 'public-read'
          };
          s3bucket.upload(params, function (err, data,) {
            if (err) {
              return callback(true, err);
           }
           else{
             return callback(false, data.Location);
           }
          });
        });
}
function AwsMp3(file, callback){
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
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          };
          s3bucket.upload(params, function (err, data,) {
            if (err) {
              return callback(true, err);
           }
           else{
             return callback(false, data);
           }
          });
        });
}
module.exports = router;