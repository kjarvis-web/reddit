const commentsRouter = require('express').Router();
const Comment = require('../models/comment');
const Post = require('../models/post');
const { LinkedList, Node } = require('../models/linkedlist');

commentsRouter.get('/', async (request, response, next) => {
  const comments = await Comment.find({});
  response.json(comments);
});

commentsRouter.get('/:_id', async (request, response, next) => {
  const comment = await Comment.findById(request.params._id);
  response.json(comment);
});

commentsRouter.post('/:_id', async (request, response, next) => {
  const comment = await Comment.findById(request.params._id);
  console.log(comment);

  const newComment = new Comment({
    text: request.body.comment,
  });

  const savedComment = await newComment.save();
  comment.comments = comment.comments.concat(savedComment);
  await comment.save();
  response.status(201).json(savedComment);
});

commentsRouter.post('/', async (request, response, next) => {
  const { id } = request.params;
  const { text } = request.body;
  const post = await Post.findById(id);
  const node = new Node({ text });
  await node.save();
  const newComment = new LinkedList({
    head: node,
  });
  const savedComment = await newComment.save();
  response.status(201).json(savedComment);
});

module.exports = commentsRouter;
