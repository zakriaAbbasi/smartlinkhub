// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var songSchema = new mongoose.Schema({
  fileName: {type: String},
  avatar: {type: String},
  cover: {type: String},
  artist: {type: String},
  timesPlayed: {type: Number},
  uploadedby: {type: String},
  category: {type: String, default: 'recent'},
});


// Export the Mongoose model
module.exports = mongoose.model('Song', songSchema);