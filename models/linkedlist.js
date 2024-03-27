const mongoose = require('mongoose');

const headSchema = new mongoose.Schema({
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
});

const nodeSchema = new mongoose.Schema({
  text: { type: String, required: true },
  next: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const LinkedList = mongoose.model('LinkedList', headSchema);
const Node = mongoose.model('Node', nodeSchema);

module.exports = { LinkedList, Node };
