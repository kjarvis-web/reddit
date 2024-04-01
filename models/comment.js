/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: String,
  date: {
    type: Date,
    default: Date.now,
  },
  parentId: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

commentSchema.set('toJSON', {
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

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
