module.exports = function(req, res, next) {
    // If the user is admin or artist, continue with the request to the restricted route
    if (req.user.usertype == "admin" || req.user.usertype == "artist") {
        return next();
    }
    
  };