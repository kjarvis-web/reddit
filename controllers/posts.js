const postsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const multerS3 = require('multer-s3');
const config = require('../utils/config');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Img = require('../models/image');
const logger = require('../utils/logger');

const s3 = new S3Client({
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
  region: config.BUCKET_REGION,
});
const PAGE_SIZE = 20;

postsRouter.get('/all', async (request, response) => {
  const posts = await Post.find({}).populate('user').populate('comments');
  response.json(posts);
});

postsRouter.get('/', async (request, response) => {
  const { page = 0 } = request.query;

  const posts = await Post.find({}, null, {
    skip: page > 0 ? parseInt(page, 10) * PAGE_SIZE : 0,
    limit: PAGE_SIZE,
  })
    .populate('user', { username: 1, name: 1 })
    .populate({
      path: 'comments',
      populate: { path: 'user' },
    })
    .sort({ created: -1 });

  response.json(posts);
});

// get total docs
postsRouter.get('/total', async (request, response) => {
  const total = await Post.countDocuments({});
  response.json({ total: Math.ceil(total / PAGE_SIZE) });
});

// get specific post
postsRouter.get('/:id', async (request, response) => {
  const post = await Post.findById(request.params.id);
  response.json(post);
});

// Token auth
const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

// post thread
const upload = multer({
  storage: multerS3({
    s3,
    bucket: config.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata(req, file, cb) {
      cb(null, { filedName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString());
    },
    location(req, file, cb) {
      cb(null, { location: file.location });
    },
  }),
});
postsRouter.post('/', upload.single('file'), async (request, response, next) => {
  const { body, file } = request;

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);

  if (body.title === undefined || !body.title) {
    return response.status(400).json({ error: 'title missing' });
  }

  const post = new Post({
    title: body.title,
    content: body.content,
    user: user.id,
    author: user,
    comments: [],
    likes: 0,
    voted: [],
    removed: false,
    edited: false,
    file: file && file.path,
  });

  const savedPost = await post.save();
  user.posts = user.posts.concat(savedPost._id);
  await user.save();

  if (file) {
    // mongo
    const image = new Img({
      threadId: savedPost._id,
      filename: file.originalname,
      url: file.location,
    });

    await image.save();
  }

  response.status(201).json(savedPost);
});

// post original comment
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

    if (!comment) {
      return response.status(400).json({ error: 'no comment' });
    }

    // create comment
    const newComment = new Comment({
      text: comment,
      user,
      parentId: post.id,
      likes: 0,
      removed: false,
      edited: false,
      thread: request.body.thread,
      author: request.body.author,
    });

    // save comment
    const savedComment = await newComment.save();

    // add comment to the corresponding user and saves to db
    user.comments = user.comments.concat(savedComment);
    await user.save();

    // add comment to post and save to db
    post.comments = post.comments.concat(savedComment);
    await post.save();

    response.status(201).json(savedComment);
  } catch (error) {
    logger.info(error);
    next(error);
  }
});

// delete post
postsRouter.delete('/:id', (request, response, next) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  Post.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// get only comments
postsRouter.get('/:id/comments', async (request, response, next) => {
  const posts = await Post.findById(request.params.id)
    .populate('comments')
    .populate('user', { username: 1 })
    .populate({
      path: 'comments',
      populate: {
        path: 'user',
        select: 'username',
      },
    });

  response.json(posts);
});

// edit post
postsRouter.put('/:id', async (request, response, next) => {
  const { body } = request;
  const { id } = request.params;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);
  const post = {
    content: body.content,
    edited: body.edited,
    user,
  };
  try {
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true }).populate('user');
    response.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

// upvote post
postsRouter.put('/:id/upvote', async (request, response, next) => {
  const { body } = request;
  const { id } = request.params;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  const post = {
    likes: body.likes,
    upVotes: body.upVotes,
    downVotes: body.downVotes,
    user,
    author: body.author,
  };

  try {
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
    response.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

// downvote post
postsRouter.put('/:id/downvote', async (request, response, next) => {
  const { body } = request;
  const { id } = request.params;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  const post = {
    likes: body.likes,
    upVotes: body.upVotes,
    downVotes: body.downVotes,
    user,
    author: body.author,
  };

  try {
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });
    response.json(updatedPost);
  } catch (error) {
    next(error);
  }
});

module.exports = postsRouter;
