const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./utils/config');

const app = express();

const postsRouter = require('./controllers/posts');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');

mongoose.set('strictQuery', false);

logger.info('connecting to', config.TEST_MONGODB_URI);

mongoose
  .connect(config.TEST_MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(cors());
// app.use(express.static('dist'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use('/api/posts', postsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
