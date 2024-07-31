const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    src: {
        type: String,
        required: true
    },
    tags: [
        {
            type: String,
        }
    ],
    category: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;