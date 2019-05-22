// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// Define our user schema
var UserSchema = new mongoose.Schema({
  username: { type: String },
  image: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  usertype: { type: String, default: 'user', required: true },
  playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
  recent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
});

// Execute before each user.save() call
UserSchema.pre('save', function (callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);