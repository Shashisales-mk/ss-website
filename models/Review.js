const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: { type: Number, required: true },
    question1: { type: String, required: true },
    question2: { type: String, required: true },
    question3: { type: String, required: true },
    question4: { type: String, required: true },
    email: { type: String,  }, 
    number: { type: String,  },
    created_at: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
