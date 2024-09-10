
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name:{ type: String, required: true } ,
    email:{ type: String, required: true },
   
    problem: { type: String, required: true },
  });


  const Chatuser = mongoose.model('Chatuser', UserSchema);

  module.exports = Chatuser;