const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const usermodel = require('../models/user');
const songModel = require('../models/songs');
const isAuthenticated = require('../config/isAuthenticated');
const isAuth = require('../config/isAuth');
const playlistModel = require('../models/playlist');
const isAdmin = require('../config/isAdmin');
const MessageModel = require('../models/guestmessage');
const MarkdownIt = require('markdown-it');
let md = new MarkdownIt();
const markDown = text => md.render(text);

const ToArray = Array => {
  let Artist = [];
  let TagsArray = JSON.parse(Array);
  for (let i = 0; i < TagsArray.length; i++) {
    Artist.push(TagsArray[i].value);
  }
  return Artist;
};
router.get('/', function (req, res, next) {
  var us = req.user;
  if (!us) {
    songModel
      .find()
      .sort({ _id: -1 })
      .limit(5)
      .then(latest => {
        latest;
        MessageModel.find()
          .sort({ _id: -1 })
          .limit(1)
          .then(message => {
            let gmessage = markDown(message[0].text);
            res.render('index', { user: null, notadmin: 'guest', text: 'Login', latestSongs: latest, guestmessage: gmessage });
          });
      }).catch(err => {
        throw err;
      }).catch(err => {
        throw err;
      });
  } else {
    songModel
      .find()
      .then(latest => {
        latest = latest.reverse();
        songModel
          .find({ category: 'popular' })
          .then(popular => {
            popular = popular.reverse();
            songModel
              .find({ category: 'favourite' })
              .then(fav => {
                fav = fav.reverse();
                songModel
                  .find()
                  .sort({ timesPlayed: -1 })
                  .then(songList => {
                    usermodel.find({ usertype: 'artist' }).then(artist => {
                      usermodel
                        .find({ playlist: { $exists: true, $ne: [] } })
                        .then(users => {
                          playlistModel
                            .find({ user: req.user._id })
                            .populate('songs')
                            .then(song => {
                              song = song.map(song => song.songs);
                              usermodel
                                .find({ _id: us._id })
                                .populate('recent')
                                .then(recentPlayed => {
                                  recentPlayed = recentPlayed.map(
                                    recentPlayed => recentPlayed.recent
                                  );
                                  if (recentPlayed[0]) {
                                    recentPlayed[0] = recentPlayed[0].reverse();
                                  }
                                  if (us && us.usertype == 'listener') {
                                    res.render('index', {
                                      playlistUser: users,
                                      recentlyPlayed: recentPlayed[0],
                                      playlist: song[0],
                                      uid: us._id,
                                      user: us.username,
                                      image: us.image,
                                      utype: null,
                                      notadmin: us.usertype,
                                      latestSongs: latest,
                                      popularSongs: popular,
                                      favSongs: fav,
                                      mostPlayed: songList,
                                      artistList: artist
                                    });
                                  } else if (us && us.usertype == 'artist') {
                                    res.render('index', {
                                      playlistUser: users,
                                      recentlyPlayed: recentPlayed[0],
                                      playlist: song[0],
                                      uid: us._id,
                                      user: us.username,
                                      image: us.image,
                                      utype: us.usertype,
                                      notadmin: us.usertype,
                                      latestSongs: latest,
                                      popularSongs: popular,
                                      favSongs: fav,
                                      mostPlayed: songList,
                                      artistList: artist
                                    });
                                  } else {
                                    res.render('index', {
                                      playlistUser: users,
                                      recentlyPlayed: recentPlayed[0],
                                      playlist: song[0],
                                      uid: us._id,
                                      user: us.username,
                                      image: us.image,
                                      utype: us.usertype,
                                      notadmin: null,
                                      latestSongs: latest,
                                      popularSongs: popular,
                                      favSongs: fav,
                                      mostPlayed: songList,
                                      artistList: artist
                                    });
                                  }
                                })
                                .catch(err => {
                                  console.log(err);
                                });
                            })
                            .catch(err => {
                              console.log(err);
                            });
                        });
                    });
                  });
              })
              .catch(err => {
                req.flash('info', 'Error Fetching data from server');
                res.redirect('/');
              });
          })
          .catch(err => {
            req.flash('info', 'Error Fetching data from server');
            res.redirect('/');
          });
      })
      .catch(err => {
        req.flash('info', 'Error Fetching data from server');
        res.redirect('/');
      });
  }
});

router.post('/addtoplaylist/:id/:user', isAuthenticated, function (
  req,
  res,
  next
) {
  playlistModel.findOne({ user: req.params.user }, (err, playlist) => {
    if (playlist == null) {
      var newPlaylist = new playlistModel({
        user: req.params.user,
        songs: req.params.id
      });
      newPlaylist.save(function (err) {
        if (err) {
          req.flash('info', 'Failed to add song');
          res.redirect('/');
        }
      });
      usermodel
        .update({ _id: req.params.user }, { playlist: newPlaylist._id })
        .then(us => {
          //console.log(us);
        });
    } else {
      updatePlaylist(req.params.user, req.params.id);
    }
  });
});

function updatePlaylist(user, song) {
  playlistModel
    .update({ user: user }, { $push: { songs: song } })
    .then(playlist => {
      if (playlist) {
        //console.log(playlist);
      }
    });
}

router.post('/deleteSong/:id/:user', isAuthenticated, function (req, res, next) {
  playlistModel
    .update({ user: req.params.user }, { $pull: { songs: req.params.id } })
    .then(playlist => {
      if (playlist) {
        //console.log(playlist);
      }
    });
});

// Recently Played  Route.

router.post('/addtoRecent/:user/:song', isAuthenticated, function (
  req,
  res,
  next
) {
  usermodel
    .update(
      { _id: req.params.user },
      { $push: { recent: { $each: [req.params.song], $slice: -6 } } }
    )
    .then(song => {
      if (!song) {
        res.redirect('/');
      }
    })
    .catch(err => {
      console.log(err);
    });
});

router.get('/login', function (req, res, next) {
  res.render('login', { layout: 'abc' });
});

router.get('/', function (req, res, next) {
  songModel.find({ category: 'popular' }).then(popular => {
    popular = popular.reverse();
    res.render('index', { popularSongs: popular });
    console.log(popular);
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', { layout: 'abc' });
});
router.get('/admin', isAuthenticated, function (req, res, next) {
  console.log(req.user);
  res.render('admin', { layout: 'admin' });
});

router.get('/guestpage', isAuth, function (req, res, next) {
  res.render('guest', { layout: 'abc' });
});

router.post('/guestpage/add', (req, res, next) => {
  var message = new MessageModel({
    text: req.body.text
  });
  message.save((err, data) => {
    if (err) {
      req.flash(
        'info',
        'cannot upload song, Please try again later :('
      );
      res.redirect('/guest');
    } else {
      res.redirect('/');
    }
  });
});

router.get('/guestpage/post', (req, res) => {
  MessageModel.find().then(message => {
    console.log(message);
  });
});

router.post('/guestpage/edit', (req, res, next) => {
  MessageModel.updateOne({
    _id: req.body.id
  },
    {
      $set: {
        text: req.body.text
      }
    })
    .then((data) => {
      console.log(data);
    })
    .catch(err => {
      throw err;
    });
});

router.get('/signup', function (req, res, next) {
  res.render('signup', { layout: 'abc' });
});

router.get('/uploadfile', isAuth, function (req, res, next) {
  res.render('uploadfile', { layout: 'abc', uploadedby: req.user.username });
});

router.get('/profile', function (req, res, next) {
  playlistModel
    .find({ user: req.user._id })
    .populate('songs')
    .then(song => {
      song = song.map(song => song.songs);
      res.render('profile', {
        playlist: song[0],
        user: req.user.username,
        user_id: req.user._id,
        uimage: req.user.image
      });
    });
});

router.get('/artistProfile/:id', function (req, res, next) {
  usermodel.findOne({ _id: req.params.id }).then(us => {
    playlistModel
      .find({ user: us._id })
      .populate('songs')
      .then(song => {
        song = song.map(song => song.songs);
        res.render('artistProfile', {
          playlist: song[0],
          user: us.username,
          uimage: us.image
        });
      });
  });
});

router.post('/signup', function (req, res) {
  if (
    !req.body.email ||
    !req.body.password ||
    !req.body.name ||
    !req.body.type
  ) {
    req.flash('info', 'Please Provide all the credentials');
    res.redirect('/signup');
  } else {
    var newUser = new usermodel({
      username: req.body.name,
      email: req.body.email,
      password: req.body.password,
      usertype: req.body.type,
      image: '../src/images/artist/user.png'
    });
    // save the user
    newUser.save(function (err) {
      if (err) {
        //console.log(err);
        req.flash('info', 'This email has already been used');
        res.redirect('/signup');
      } else {
        req.flash('info', 'Success');
        res.redirect('/login');
      }
    });
  }
});

router.post('/login', function (req, res, next) {
  if (req.body.email == 'admin@dmt.com' && req.body.password == 'dmt') {
    var user = { username: 'admin', usertype: 'admin' };
    req.logIn(user, function (err) {
      if (err) {
        req.flash('info', 'Error logging in');
        res.redirect('/login');
      } else {
        res.redirect('/');
      }
    });
  } else {
    passport.authenticate('local', function (err, user, info) {
      if (user == false) {
        req.flash('info', info.message);
        res.redirect('/login');
      } else {
        req.logIn(user, function (err) {
          if (err) {
            req.flash('info', 'Error logging in');
            res.redirect('/login');
          } else {
            res.redirect('/');
          }
        });
      }
    })(req, res, next);
  }
});
router.post('/members', isAuthenticated, function (req, res) {
  res.send('Authenticated members page');
});

router.get('/artist', isAdmin, function (req, res, next) {
  usermodel
    .find({ usertype: 'artist' })
    .select('username usertype')
    .then(artist => {
      res.render('artist', { layout: 'admin', artistList: artist });
    })
    .catch(err => {
      req.flash('info', 'Error Fetching data from server');
      res.redirect('/');
    });
});

router.get('/songs/:artist', isAdmin, function (req, res, next) {
  songModel
    .find({
      uploadedby: req.params.artist
    })
    .select('_id SongTitle avatar artist timesPlayed uploadedby category ReleaseDate')
    .then(artist => {
      res.render('songs', { layout: 'admin', artistList: artist });
    })
    .catch(err => {
      req.flash('info', 'Error Fetching data from server');
      res.redirect('/');
    });
});


router.get('/song/:id', (req, res) => {
  songModel
    .findOne({
      _id: req.params.id
    }).then(song => {
      song
      res.render('songsedit', {
        layout: 'abc',
        id: song._id,
        Songtitle: song.SongTitle,
        Releasedate: song.ReleaseDate,
        Code: song.IsrcCode,
        Artistname: song.artist,
        Songgenre: song.Genre,
        FeaturedArtist: song.FeaturedArtist,
        category: song.category
      });
    });
});


router.post('/song/edit', (req, res) => {
  let FeaturedArtist = ToArray(req.body.tags);
  songModel.updateOne({
    _id: req.body.id
  },
    {
      $set: {
        SongTitle: req.body.Songtitle,
        ReleaseDate: req.body.Releasedate,
        FeaturedArtist: FeaturedArtist,
        IsrcCode: req.body.Code,
        Genre: req.body.genre,
        category: req.body.category,
        artist: req.body.Artistname
      }
    }, {
      new: true
    })
    .then((data) => {
      console.log(data);
    })
    .catch(err => {
      throw err;
    });
})


router.post('/deleteArtist/:id', isAdmin, function (req, res, next) {
  usermodel
    .findOneAndDelete({
      _id: req.params.id
    })
    .then(user => {
      if (user) {
        req.flash('info', 'Deleted successfully');
      }
    })
    .catch(err => {
      req.flash('info', 'Error Fetching data from server');
    });
});

//Delete Route For Admin.
router.post('/delete/:id', isAdmin, function (req, res, next) {
  songModel
    .findOneAndDelete({
      _id: req.params.id
    })
    .then(song => {
      if (song) {
        req.flash('info', 'Deleted successfully');
      }
    })
    .catch(err => {
      req.flash('info', 'Error Fetching data from server');
    });
});

router.get('/category/:id/:opt', isAuthenticated, function (req, res, next) {
  const id = req.params.id;
  const category = req.params.opt;
  if (category == 'pop&fav') {
    songModel
      .updateOne(
        { _id: id },
        { $addToSet: { category: ['popular', 'favourite'] } }
      )
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
  }
  if (category == 'pop') {
    songModel
      .updateOne({ _id: id }, { $addToSet: { category: 'popular' } })
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
    songModel
      .updateOne({ _id: id }, { $pull: { category: 'favourite' } })
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
  }
  if (category == 'fav') {
    songModel
      .updateOne({ _id: id }, { $pull: { category: 'popular' } })
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
    songModel
      .updateOne({ _id: id }, { $addToSet: { category: 'favourite' } })
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
  }
  if (category == 'none') {
    songModel
      .updateOne(
        { _id: id },
        { $pullAll: { category: ['popular', 'favourite'] } }
      )
      .then()
      .catch(err => {
        req.flash('info', 'Error while updating data');
        res.redirect('/');
      });
  }
});

module.exports = router;
