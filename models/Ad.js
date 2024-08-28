const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  title: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  linkPath: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^\s$.?#].[^\s]*$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
});

module.exports = mongoose.model('Ad', adSchema);