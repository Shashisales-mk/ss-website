const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: String,
  type: {
    type: String,
    enum: ['text', 'mcq'],
    default: 'text'
  },
  options: [String], // For MCQ questions
  
});

module.exports = mongoose.model('Question', QuestionSchema);