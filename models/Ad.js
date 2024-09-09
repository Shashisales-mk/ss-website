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
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, 
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }, 
  activeDays: { type: [String], required: true },
  clickCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Ad', adSchema);
