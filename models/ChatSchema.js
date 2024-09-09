const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatuser' },
    initialQuestions: [{
      question: String,
      answer: String
    }],
    messages: [{
      content: String,
      sender: String,
      timestamp: { type: Date, default: Date.now }
    }],
    isOpen: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    closedAt: Date
  });

  const Chat = mongoose.model('Chat', ChatSchema);

  module.exports = Chat;