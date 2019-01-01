var register = function(Handlebars) {
    var helpers = {
    userinfo: function(req) {
        if(!req.user){return 'Login'}
        else{return 'Signed in as:'+req.user.email};
    },
    ifuser: function(req) {
        console.log('hereiis');
        if(req.user){console.log('true')};
        return (req.user) ? options.fn(this) : options.inverse(this);
    },
    ifnotuser: function(req) {
        console.log('hereiis');
        if(!req.user){console.log('false')};
        return (!req.user) ? options.fn(this) : options.inverse(this);
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