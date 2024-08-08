const mongoose = require('mongoose');

const testimonialPageSchema = new mongoose.Schema({
  testimonial: { type: mongoose.Schema.Types.ObjectId, ref: 'Testimonial' },
  successStory: { type: String, default: '' },
  growthStory: { type: String, default: '' },
  caseStudy: { type: String, default: '' }
});

module.exports = mongoose.model('TestimonialPage', testimonialPageSchema);