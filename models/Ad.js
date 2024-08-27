const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  title: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Ad', adSchema);
