// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var GuestMessage = new mongoose.Schema({
  text: { type: String }
});

// Export the Mongoose model
module.exports = mongoose.model('Message', GuestMessage);
