const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  threadId: String,
  filename: String,
});

module.exports = mongoose.model('Image', imageSchema);
