const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
    urlId: {
        type : String,
        required : true,
        unique : true
    },
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
    experience: {
        type: String,
        enum: ['Entry Level', 'Mid', 'Senior'],
        default: 'Mid',
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full Time', 'Part Time','Contract'],
        default: 'Part Time',
        required: true
    },
    
    requirements: {
        type: [String], 
        
    },
    qualifications: {
        type: [String],
        
    },
    description: {
        type: String, 
        
    },
    responsibilities: {
        type: [String], 
        
    },
    skills: {
        type: String,
        required: true
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
