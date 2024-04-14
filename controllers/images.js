const imageRouter = require('express').Router();
const Img = require('../models/image');

imageRouter.get('/', async (request, response) => {
  const images = await Img.find({});
  response.json(images);
});

module.exports = imageRouter;
