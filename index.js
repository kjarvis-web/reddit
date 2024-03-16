require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const Post = require('./models/post');

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.send('test');
});

app.get('/api/posts', (_req, res) => {
  Post.find({}).then((posts) => res.json(posts));
});

app.get('/api/posts/:id', (req, res) => {
  Post.findById(req.params.id).then((post) => res.json(post));
});

app.post('/api/posts', (req, res) => {
  const { body } = req;

  const post = new Post({
    title: body.title,
    content: body.content,
  });

  post.save().then((savedPost) => {
    res.json(savedPost);
  });
});

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
