const express = require('express');
const router = express.Router();
const songsModel = require('../models/songs');
const usermodel = require('../models/user');
const AWS = require('aws-sdk');
const isAuthenticated = require('../config/isAuthenticated');
const videoModel = require('../models/video');
const AlbumModel = require('../models/Album');
// var filemanager = require('easy-file-manager');

const ToArray = Array => {
  let Artist = [];
  let TagsArray = JSON.parse(Array);
  for (let i = 0; i < TagsArray.length; i++) {
    Artist.push(TagsArray[i].value);
  }
  return Artist;
};

router.post('/upload', function (req, res) {
  console.log(req.body);
  if (!req.files.file1 || !req.files.file2 || !req.body.artist) {
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/uploadfile');
  } else {
    AwsImage(req.files.file2, (err, data) => {
      if (err === true) {
        req.flash('info', 'cannot upload song, Please try again later :(');
        res.redirect('/uploadfile');
      } else {
        req.body.imgurl = data;
        AwsMp3(req.files.file1, (err, data) => {
          if (err === true) {
            console.log(err);
            req.flash('info', 'cannot upload song, Please try again later :(');
            res.redirect('/uploadfile');
          } else {
            let TagArray = ToArray(req.body.tags3);
            var mp3 = new songsModel({
              fileName: req.files.file1.name,
              avatar: req.body.imgurl,
              artist: req.body.artist,
              cover: req.files.file2.name,
              uploadedby: req.body.uploadedby,
              Genre: req.body.Genre,
              SongTitle: req.body.Title,
              ReleaseDate: req.body.ReleaseDate,
              IsrcCode: req.body.Code,
              FeaturedArtist: TagArray,
              timesPlayed: 0,
              category: []
            });
            mp3.save(err => {
              if (err) {
                console.log(err, 'cannot upload');
                req.flash(
                  'info',
                  'cannot upload song, Please try again later :('
                );
                res.redirect('/uploadfile');
              } else {
                // req.flash('info', 'Successfully uploaded');
                res.redirect('/');
              }
            });
          }
        });
      }
    });
  }
});


// Video Route
router.post('/video/upload', function (req, res) {
  if (!req.body.Title || !req.body.artist || !req.files.file1 || !req.files.file2) {
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/uploadvideo');
  } else {
    AwsImage(req.files.file2, (err, data) => {
      if (err === true) {
        req.flash('info', 'cannot upload song, Please try again later :(');
        res.redirect('/uploadfile');
      } else {
        let imgurl = data;
        console.log(imgurl);
        AwsMp3(req.files.file1, (err, data) => {
          if (err === true) {
            req.flash('info', 'cannot upload Video, Please try again later :(');
            res.redirect('/uploadvideo');
          } else {
            let Video = new videoModel({
              filename: req.files.file1.name,
              VideoTitle: req.body.Title,
              Artist: req.body.artist,
              uploadedby: req.body.uploadedby,
              VideoImg: imgurl
            });
            console.log(Video);
            Video.save(err => {
              if (err) {
                req.flash(
                  'info',
                  'cannot upload Video, Please try again later :('
                );
                console.log(err);
                res.redirect('/uploadvideo');
              } else {
                res.redirect('/');
              }
            });
          }
        });
      }
    });
  }
});


router.post('/createalbum', isAuthenticated, function (req, res) {
  console.log(req.body);
  if (!req.body) {
    req.flash('info', 'Please Provide all the credentials');
    return res.redirect('/');
  }
  AwsImage(req.files.file1, (err, data) => {
    if (err === true) {
      req.flash('info', 'cannot upload Video, Please try again later :(');
      res.redirect('/album');
    }
    let imgurl = data;
    let songs = req.body.songs;
    let songsarray = songs.split(',');

    let album = new AlbumModel({
      albumName: req.body.albumname,
      albumImg: imgurl,
      songs: songsarray,
    });
    album.save(err => {
      if (err) {
        console.log(err);
      }
      else {
        res.json({
          message: "Success"
        });
      }
    });

  });
});








router.get('/video/download', function (req, res) {
  videoModel.findOneAndUpdate(
    { filename: req.query.id },
    { $inc: { timesPlayed: 1 } },
    { useFindAndModify: false },
    err => {
      if (err) {
        console.log('Error updating song');
      }
    }
  );

  let s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
  });
  var params = {
    Bucket: process.env.AWS_BUCKET,
    Key: req.query.id
  };

  var stream = s3bucket.getObject(params).createReadStream();
  // forward errors
  stream.on('error', function error(err) {
    console.log('error streaming this Video ', err);
  });
  stream.on('end', () => {
    console.log('Served by Amazon S3: ' + params.Key);
  });
  //Pipe the s3 object to the response
  stream.pipe(res);
});















//Route to download file from AWS bucket
router.get('/download', function (req, res) {
  songsModel.findOneAndUpdate(
    { fileName: req.query.id },
    { $inc: { timesPlayed: 1 } },
    { useFindAndModify: false },
    err => {
      if (err) {
        console.log('Error updating song');
      }
    }
  );

  let s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET
  });
  var params = {
    Bucket: process.env.AWS_BUCKET,
    Key: req.query.id
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

function AwsImage(file, callback) {
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
    s3bucket.upload(params, function (err, data) {
      if (err) {
        return callback(true, err);
      } else {
        return callback(false, data.Location);
      }
    });
  });
}
function AwsMp3(file, callback) {
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
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
    s3bucket.upload(params, function (err, data) {
      if (err) {
        return callback(true, err);
      } else {
        return callback(false, data);
      }
    });
  });
}



router.post('/uploadImage/:id', function (req, res) {
  if (!req.files.file1) {
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/profile');
  } else {
    AwsImage(req.files.file1, (err, data) => {
      if (err === true) {
        req.flash('info', 'cannot upload image, Please try again later :(');
        res.redirect('/profile');
      } else {
        usermodel
          .updateOne({ _id: req.params.id }, { image: data })
          .then(user => {
            if (!user) {
              req.flash(
                'info',
                'cannot upload image, Please try again later :('
              );
              res.redirect('/profile');
            } else {
              req.user.image = data;
              res.redirect('/');
            }
          });
      }
    });
  }
});
module.exports = router;