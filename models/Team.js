const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String},
  description:{ type: String, required: true }
});

module.exports = mongoose.model('Team', teamSchema);