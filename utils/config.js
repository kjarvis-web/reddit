require('dotenv').config();

const { PORT } = process.env;
const { MONGODB_URI } = process.env;
const { BUCKET_NAME } = process.env;
const { BUCKET_REGION } = process.env;
const { AWS_ACCESS_KEY_ID } = process.env;
const { AWS_SECRET_ACCESS_KEY } = process.env;

module.exports = {
  MONGODB_URI,
  PORT,
  BUCKET_NAME,
  BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
};
