const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const TestimonialPage = require('../models/TestimonialPage');
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

// Add new testimonial
router.post('/admin/add-testimonial', upload.single('image'), async (req, res) => {
  try {
    const newTestimonial = new Testimonial({
      text: req.body.text,
      name: req.body.name,
      image: `/uploads/${req.file.filename}`
    });
    await newTestimonial.save();
    res.redirect('/all-blogs-list');
  } catch (error) {
    res.status(500).send(error.message);
  }
});


router.post('/admin/add-testimonial-page/', async (req, res) => {

  try {
    // const testimonialId = req.params.testimonialId;
    const { successStory, growthStory, caseStudy, testimonialId, problemStatement,
      clientOverview,
      challenges,
      objectives,
      solution,
      result,
      conclusion } = req.body;


    if (!testimonialId) {
      return res.status(400).send('Testimonial ID is required');
    }

    const newTestimonialPage = new TestimonialPage({
      testimonial: testimonialId,
      successStory,
      growthStory,
      caseStudy,
      problemStatement,
      clientOverview,
      challenges,
      objectives,
      solution,
      result,
      conclusion
    });

    const savedPage = await newTestimonialPage.save();
    await Testimonial.findByIdAndUpdate(testimonialId, { page: savedPage._id });

    res.redirect('/all-blogs-list');
  } catch (error) {
    console.error('Error adding testimonial page:', error);
    res.status(500).send('Error adding testimonial page');
  }
});


// Delete testimonial
router.post('/admin/delete-testimonial/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (testimonial.page) {
      await TestimonialPage.findByIdAndDelete(testimonial.page);
    }
    await Testimonial.findByIdAndDelete(req.params.id);
    res.redirect('/all-blogs-list');
  } catch (error) {
    res.status(500).send(error.message);
  }
});



// Update testimonial
router.post('/admin/update-testimonial/:id', upload.single('image'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).send('Testimonial not found');
    }

    const updateData = {
      text: req.body.text,
      name: req.body.name,
      image: testimonial.image // Default to the existing image
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await Testimonial.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/all-blogs-list');  // or wherever your admin panel is
  } catch (error) {
    res.status(500).send(error.message);
  }
});



// Update testimonial page
router.post('/admin/update-testimonial-page/:id', async (req, res) => {
  try {
    const {
      successStory,
      growthStory,
      caseStudy,
      problemStatement,
      clientOverview,
      challenges,
      objectives,
      solution,
      result,
      conclusion
    } = req.body;

    const updatedFields = {
      successStory,
      growthStory,
      caseStudy,
      problemStatement,
      clientOverview,
      challenges,
      objectives,
      solution,
      result,
      conclusion
    };

    // Remove undefined fields
    Object.keys(updatedFields).forEach(key =>
      updatedFields[key] === undefined && delete updatedFields[key]
    );

    await TestimonialPage.findByIdAndUpdate(req.params.id, updatedFields);
    res.redirect('/all-blogs-list');  // or wherever your admin panel is
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/testimonial/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).populate('page');
    if (!testimonial) {
      return res.status(404).send('Testimonial not found');
    }
    res.render('testimonial-page', { testimonial });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;