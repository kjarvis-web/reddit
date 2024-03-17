const postsRouter = require('express').Router();
const Post = require('../models/post');
const User = require('../models/user');

postsRouter.get('/', (request, response) => {
  Post.find({}).then((posts) => {
    response.json(posts);
  });
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

postsRouter.post('/', async (request, response, next) => {
  const { body } = request;

  const user = await User.findById(body.userId);

  if (body.title === undefined) {
    return response.status(400).json({ error: 'title missing' });
  }

  const post = new Post({
    title: body.title,
    content: body.content,
    user: user.id,
  });

  //   post
  //     .save()
  //     .then((savedPost) => {
  //       response.json(savedPost);
  //     })
  //     .catch((error) => next(error));

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

postsRouter.put('/:id', (request, response, next) => {
  const { body } = request;

  const post = { title: body.title, content: body.content };

  Post.findByIdAndUpdate(request.params.id, post, { new: true })
    .then((updatedPost) => {
      response.json(updatedPost);
    })
    .catch((error) => next(error));
});

module.exports = postsRouter;
