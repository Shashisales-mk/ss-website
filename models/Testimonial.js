const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  text: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  page: { type: mongoose.Schema.Types.ObjectId, ref: 'TestimonialPage' }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);