const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.TEST_MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Post = mongoose.model('Post', postSchema);

const post = new Post({
  title: 'Third Post',
  content: 'Here is the third post for the backend',
});

// post.save().then((res) => {
//   console.log('post saved');
//   mongoose.connection.close();
// });

Post.find({}).then((res) => {
  res.forEach((p) => console.log(p));
  mongoose.connection.close();
});

// note.save().then((result) => {
//   console.log('note saved');
//   mongoose.connection.close();
// });

// Note.find({}).then((result) => {
//   result.forEach((note) => {
//     console.log(note);
//   });
//   mongoose.connection.close();
// });
