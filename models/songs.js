// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var songSchema = new mongoose.Schema({
  fileName: {type: String},
  avatar: {type: String},
  artist: {type: String},
  timesPlayed: {type: Number},
  uploadedby: {type: String},
});


// Export the Mongoose model
module.exports = mongoose.model('Song', songSchema);