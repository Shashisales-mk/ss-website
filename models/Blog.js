const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    bannerImage: { type: String, required: true },
    showImg: { type: String, required: true },
    content: [{
        heading: String,
        paragraph: String,
        image: String
    }],
    metaTitle: { type: String, required: true },
    canonical: { type: String, required: true },
    contentText: { type: Object, required: true },
    metaDescription: { type: String, required: true },
    metaKeywords: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    isLatest: { type: Boolean, default: true }, 
    isPopular: { type: Boolean, default: false } ,
    isApprove: { type: Boolean, default: false } ,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
