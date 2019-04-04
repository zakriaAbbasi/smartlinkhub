module.exports = function(req, res, next) {
    // If the user is logged in, continue with the request to the restricted route
    if(!req.user)
    {
        console.log('not signed in as Admin');
        res.redirect('/login'); 
    }
    else if (req.user.usertype == "admin") {
        return next();
    }
    else 
    {
        req.flash('info', 'Restricted AREA');
        res.redirect('/');
    }
  };