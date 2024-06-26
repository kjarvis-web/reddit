const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  likes: Number,
  created: { type: Number, default: Date.now },
  upVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  removed: Boolean,
  edited: Boolean,
  file: Buffer,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    returnedObject.date = new Date(returnedObject.date).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },
});

module.exports = mongoose.model('Post', postSchema);
