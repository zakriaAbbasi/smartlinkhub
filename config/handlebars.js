var register = function(Handlebars) {
    var helpers = {
    userinfo: function(req) {
        console.log('here', req.user);
        if(!req.user){return 'Login'}
        else{return req.user.email};
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

module.exports.register = register;
module.exports.helpers = register(null); 