require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
console.log('connecting to', process.env.TEST_MONGODB_URI);
mongoose
  .connect(process.env.TEST_MONGODB_URI)
  .then((result) => console.log('connected to MongoDB'))
  .catch((error) => console.log('error connectin to MongoDB: ', error.message));

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: String,
});

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Post', postSchema);
