module.exports = function(req, res, next) {
    // If the user is admin or artist, continue with the request to the restricted route
    if(!req.user)
    {
        res.redirect('/login'); 
    }
    else if (req.user.usertype == "admin" || req.user.usertype == "artist") {
        return next();
    }
    else 
    {
        req.flash('info', 'Can not upload as a listener');
        res.redirect('/');
    }
  };