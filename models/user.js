const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  passwordHash: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // toString() was removed here because it was breaking but it seems to work fine without it
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
    returnedObject.date = new Date(returnedObject.date).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
