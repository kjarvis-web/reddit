const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
    .populate(
      'posts'
      // {
      //   title: 1,
      //   content: 1,
      //   created: 1,
      //   date: 1,
      //   upVotes: 1,
      //   downVotes: 1,
      // }
    )
    .populate(
      'comments'
      // {
      //   text: 1,
      //   parentId: 1,
      //   created: 1,
      //   date: 1,
      //   upVotes: 1,
      //   downVotes: 1,
      // }
    );
  response.json(users);
});

module.exports = usersRouter;
