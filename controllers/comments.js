const commentsRouter = require('express').Router();
const Comment = require('../models/comment');

commentsRouter.get('/', (request, response, next) => {
  Comment.find({})
    .then((comment) => {
      if (comment) {
        response.json(comment);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

commentsRouter.get('/:c_id', async (request, response, next) => {
  const comment = await Comment.findById(request.params.c_id);
  response.json(comment);
});

commentsRouter.post('/:c_id', async (request, response, next) => {
  const comment = await Comment.findById(request.params.c_id);

  const newComment = new Comment({
    text: request.body.comment,
  });

  const savedComment = await newComment.save();
  comment.comments = comment.comments.concat(savedComment);
  await comment.save();
  response.status(201).json(savedComment);
});

module.exports = commentsRouter;
