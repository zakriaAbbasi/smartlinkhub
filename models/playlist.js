// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var playlistSchema = new mongoose.Schema({
  user: {type: String},
  songs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Song'}]
});


// Export the Mongoose model
module.exports = mongoose.model('Playlist', playlistSchema);