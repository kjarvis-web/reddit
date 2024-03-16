require('dotenv').config();

const { PORT } = process.env;
const { TEST_MONGODB_URI } = process.env;

module.exports = {
  TEST_MONGODB_URI,
  PORT,
};
