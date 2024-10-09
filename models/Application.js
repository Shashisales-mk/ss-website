// Consolidated Application Model
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        required: true
    },
    jobName: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique : true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        trim: true
    },
    phone: {
        type: String,
        required: true,
        match: [/^[0-9\s+()-]{10,20}$/, 'Please enter a valid phone number']
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },

    company: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    startDate: {
        month: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    },
    endDate: {
        month: String,
        year: Number
    },
    currentCTC: {
        type: Number,
        required: true
    },
    expectedCTC: {
        type: Number,
        required: true
    },
    totalExperience: {
        type: Number,
        required: true
    },
    np: {
        type: Number,
        required: true
    },
    lwd: {
        type: Date
        
    },
    skills: {
        type: String,
        required: true
    },

    additionalInfo: String,
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'rejected', 'hired'],
        default: 'applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

applicationSchema.index({email: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;