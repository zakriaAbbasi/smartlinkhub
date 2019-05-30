// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var videoSchema = new mongoose.Schema({
    filename: { type: String },
    VideoTitle: { type: String },
    timesPlayed: { type: Number },
    Artist: { type: String },
    uploadedby: { type: String },
    VideoImg: { type: String }

});

// Export the Mongoose model
module.exports = mongoose.model('Video', videoSchema);
