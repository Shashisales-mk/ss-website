const mongoose = require('mongoose');

const testimonialPageSchema = new mongoose.Schema({
  testimonial: { type: mongoose.Schema.Types.ObjectId, ref: 'Testimonial' },
  successStory: { type: String, default: '' },
  growthStory: { type: String, default: '' },
  caseStudy: { type: String, default: '' },
  problemStatement: { type: String, default: '' },
  clientOverview: { type: String, default: '' },
  challenges: { type: String, default: '' },
  objectives: { type: String, default: '' },
  solution: { type: String, default: '' },
  result: { type: String, default: '' },
  conclusion: { type: String, default: '' }

  
});

module.exports = mongoose.model('TestimonialPage', testimonialPageSchema);