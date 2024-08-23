const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: String,
  type: {
    type: String,
    enum: ['text', 'mcq'],
    default: 'text'
  },
  options: [String], // For MCQ questions
  placeholders: [String]
  
});

module.exports = mongoose.model('Question', QuestionSchema);