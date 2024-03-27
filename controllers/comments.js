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

commentsRouter.post('/:c_id', async (request, response, next) => {
  const comment = await Comment.findById(request.params.c_id);
});

module.exports = commentsRouter;
