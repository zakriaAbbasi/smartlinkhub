var mongoose = require('mongoose');


var AlbumSchema = new mongoose.Schema({
    albumName: { type: String },
    albumImg: { type: String },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
});


// Export the Mongoose model
module.exports = mongoose.model('Album', AlbumSchema);