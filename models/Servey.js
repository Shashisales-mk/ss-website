const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String
  }],
  serialBias: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survey', SurveySchema);