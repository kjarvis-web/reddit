const postsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const logger = require('../utils/logger');

postsRouter.get('/', async (request, response) => {
  const posts = await Post.find({})
    .populate('user', { username: 1, name: 1 })
    .populate('comments', { text: 1, user: 1 });
  response.json(posts);
});

postsRouter.get('/:id', (request, response, next) => {
  Post.findById(request.params.id)

    .then((post) => {
      if (post) {
        response.json(post);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Token auth
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

postsRouter.post('/', async (request, response, next) => {
  const { body } = request;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);

  if (body.title === undefined) {
    return response.status(400).json({ error: 'title missing' });
  }

  const post = new Post({
    title: body.title,
    content: body.content,
    user: user.id,
    comments: [],
  });

  const savedPost = await post.save();
  user.posts = user.posts.concat(savedPost._id);
  await user.save();

  response.status(201).json(savedPost);
});

postsRouter.delete('/:id', (request, response, next) => {
  Post.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// postsRouter.put('/:id', (request, response, next) => {
//   const { body } = request;

//   const post = { title: body.title, content: body.content, comments: body.comment };

//   Post.findByIdAndUpdate(request.params.id, post, { new: true })
//     .then((updatedPost) => {
//       response.json(updatedPost);
//     })
//     .catch((error) => next(error));
// });

// add comments for [string]
// postsRouter.post('/:id/comments', async (request, response, next) => {
//   const { comment } = request.body;
//   const { id } = request.params;

//   try {
//     const thread = await Post.findById(id);
//     thread.comments = thread.comments.concat(comment);
//     const updatedThread = await thread.save();
//     response.status(201).json(updatedThread);
//   } catch (error) {
//     logger.info(error);
//     next(error);
//   }
// });

postsRouter.post('/:id/comments', async (request, response, next) => {
  const { comment } = request.body;
  const { id } = request.params;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  try {
    // get user

    const user = await User.findById(decodedToken.id);

    // get post id
    const post = await Post.findById(id);

    // create comment
    const newComment = new Comment({
      text: comment,
      user: user.id,
      originalId: post.id,
    });

    // save comment
    const savedComment = await newComment.save();

    // add comment to the corresponding user and saves to db
    user.comments = user.comments.concat(savedComment);
    await user.save();

    post.comments = post.comments.concat(savedComment);
    await post.save();
    console.log(savedComment);
    response.status(201).json(savedComment);
  } catch (error) {
    logger.info(error);
    next(error);
  }
});

module.exports = postsRouter;
