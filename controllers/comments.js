const commentsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Comment = require('../models/comment');
const User = require('../models/user');

commentsRouter.get('/', async (request, response, next) => {
  const comments = await Comment.find({}).populate('comments').populate('user');
  response.json(comments);
});

commentsRouter.get('/:id', async (request, response, next) => {
  const comment = await Comment.findById(request.params.id);

  response.json(comment);
});

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  console.log('here');
  return null;
};

commentsRouter.post('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const user = await User.findById(decodedToken.id);

  const comment = await Comment.findById(request.params.id);

  if (!request.body.comment) {
    return response.status(400).json({ error: 'comment missing' });
  }

  const newComment = new Comment({
    text: request.body.comment,
    parentId: request.params.id,
    username: user.username,
  });

  const savedComment = await newComment.save();
  comment.comments = comment.comments.concat(savedComment);
  await comment.save();
  response.status(201).json(savedComment);
});

module.exports = commentsRouter;
