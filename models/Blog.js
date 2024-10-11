
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    bannerImage: { type: String, required: true },
    showImg: { type: String, required: true },
    content: [{
        heading: String,
        paragraph: String,
        image: String,
        altTag : String
    }],
    videoUrl: { type: String },
    metaTitle: { type: String, required: true },
    canonical: { type: String, required: true, unique: true,
        trim: true },
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

blogSchema.pre('save', function(next) {
    if (this.canonical) {
        this.canonical = this.canonical.trim();
    }
    next();
});

module.exports = Blog;
