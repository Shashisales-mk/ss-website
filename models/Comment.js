const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    name: String,
    email: String,
    comment: String,
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);