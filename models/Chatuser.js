
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    number: String,
    problem: String,
  });


  const Chatuser = mongoose.model('Chatuser', UserSchema);

  module.exports = Chatuser;