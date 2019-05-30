// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var songSchema = new mongoose.Schema({
  Genre: { type: String },
  SongTitle: { type: String },
  ReleaseDate: { type: String },
  IsrcCode: { type: String },
  fileName: { type: String },
  FeaturedArtist: [],
  avatar: { type: String },
  cover: { type: String },
  artist: { type: String },
  timesPlayed: { type: Number },
  uploadedby: { type: String },
  category: []
});

// Export the Mongoose model
module.exports = mongoose.model('Song', songSchema);
