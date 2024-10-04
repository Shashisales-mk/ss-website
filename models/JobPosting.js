const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    jobType: {
        type: String,
        enum: ['Entry Level', 'Mid', 'Senior', 'Contract'],
        default: 'Mid',
        required: true
    },
    requirements: {
        type: [String], // Array of strings to store job requirements
        
    },
    qualifications: {
        type: [String], // Array of strings to store preferred qualifications
        
    },
    description: {
        type: String, // Detailed job description (HTML allowed using Jodit editor)
        
    },
    responsibilities: {
        type: [String], // Responsibilities (HTML allowed using Jodit editor)
        
    },
    salary: {
        type: String, // String to allow salary range input
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Middleware to update `updatedAt` field before saving
jobPostingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const JobPosting = mongoose.model('JobPosting', jobPostingSchema);

module.exports = JobPosting;
