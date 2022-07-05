const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
