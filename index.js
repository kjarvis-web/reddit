require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const Post = require('./models/post');

app.use(express.json());
app.use(cors());

app.get('/', (_req, response) => {
  response.send('test');
});

app.get('/api/posts', (_req, response) => {
  Post.find({}).then((posts) => response.json(posts));
});

app.get('/api/posts/:id', (request, response) => {
  Post.findById(request.params.id).then((post) => response.json(post));
});

app.post('/api/posts', (request, response, next) => {
  const { body } = request;

  if (body.title === undefined) {
    return response.status(400).json({ error: 'title missing' });
  }

  const post = new Post({
    title: body.title,
    content: body.content,
  });

  post
    .save()
    .then((savedPost) => {
      response.json(savedPost);
    })
    .catch((error) => next(error));
});

app.delete('/api/posts/:id', (request, response, next) => {
  Post.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put('/api/posts/:id', (request, response, next) => {
  const { body } = request;

  const post = { title: body.title, content: body.content };

  Post.findByIdAndUpdate(request.params.id, post, { new: true })
    .then((updatedPost) => {
      response.json(updatedPost);
    })
    .catch((error) => next(error));
});

// middleware
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path: ', request.path);
  console.log('Body: ', request.body);
  console.log('---');
  next();
};

// for catching requests made to non-existent routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoints' });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(requestLogger);
app.use(unknownEndpoint);
// errorHandler must be last loaded middleware. all routes should be registered before this
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
