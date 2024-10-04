const express = require('express');
const router = express.Router();
const JobPosting = require('../models/JobPosting');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');

const flash = require('connect-flash');

router.use(flash());


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // Using the existing uploads folder in public directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports PDF, DOC, DOCX formats."));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});



// Route to handle form submission
// Route to handle form submission
router.post('/job/add', async (req, res) => {
  try {
    const { title, location, jobType, requirements, qualifications, description, responsibilities, salary } = req.body;

    // Convert requirements, qualifications, and responsibilities to arrays and filter out empty entries
    const requirementsArray = requirements ? requirements.split('\n').map(item => item.trim()).filter(item => item !== '') : null;
    const qualificationsArray = qualifications ? qualifications.split('\n').map(item => item.trim()).filter(item => item !== '') : null;
    const responsibilitiesArray = responsibilities ? responsibilities.split('\n').map(item => item.trim()).filter(item => item !== '') : null;

    // Description remains a string, but set it to null if empty
    const descriptionField = description ? description.trim() : null;

    const newJob = new JobPosting({
      title,
      location,
      jobType,
      requirements: requirementsArray,
      qualifications: qualificationsArray,
      description: descriptionField,
      responsibilities: responsibilitiesArray,
      salary
    });

    await newJob.save(); // Save job to database
    req.flash('success', 'Job is added to queue successfully');
    res.redirect('/admin-panel'); // Redirect back to job listings page
  } catch (err) {
    console.error(err);
    req.flash('error', 'There is some error while adding Job, please try again later');
    res.status(500).send('Server Error');
  }
});



// Route to render edit job form
router.get('/job/edit/:id', async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id); // Fetch job by ID
    if (!job) {
      return res.status(404).send('Job not found');
    }
    res.render('editJob', {
      job,
      title: "",
      description: "",
      keywords: ""
    }); // Render the edit form with job data
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// Route to handle edit form submission
router.post('/job/edit/:id', async (req, res) => {
  try {
    const { title, location, jobType, requirements, qualifications, description, responsibilities, salary } = req.body;

    // Convert text areas into arrays
    const requirementsArray = requirements.split('\n').map(item => item.trim());
    const qualificationsArray = qualifications.split('\n').map(item => item.trim());
    const responsibilitiesArray = responsibilities.split('\n').map(item => item.trim());


    const job = await JobPosting.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }

    // Update job fields
    job.title = title;
    job.location = location;
    job.jobType = jobType;
    job.requirements = requirementsArray;
    job.qualifications = qualificationsArray;
    job.description = description;
    job.responsibilities = responsibilitiesArray;
    job.salary = salary;

    await job.save(); // Save updated job data

    req.flash('success', 'Job is updated successfully');

    res.redirect('/admin-panel'); // Redirect to job listings page
  } catch (err) {
    req.flash('error', 'There is some error while Updating Job, please try again letter');

    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route to handle job deletion
router.post('/job/delete/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await JobPosting.findByIdAndDelete(jobId); // Delete the job using findByIdAndDelete

    if (!job) {
      return res.status(404).send('Job not found');
    }
    req.flash('success', 'Job is Deleted successfully');
    res.redirect('/admin-panel'); // Redirect to admin panel after deletion
  } catch (err) {
    console.error(err);
    req.flash('error', 'There is some error while deleting the Job, please try again letter');
    res.status(500).send('Server Error');
  }
});



router.post('/submit-application', upload.single('resume'), async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'jobId',
      'company', 'jobTitle', 'startDate.month', 'startDate.year', 'currentCTC', 'expectedCTC', 'skills'
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Create application data object
    const applicationData = {
      jobId: req.body.jobId,
      resume: req.file ? `/uploads/${req.file.filename}` : null,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      company: req.body.company,
      jobTitle: req.body.jobTitle,
      startDate: {
        month: req.body['startDate.month'],
        year: parseInt(req.body['startDate.year'])
      },
      endDate: req.body['endDate.month'] ? {
        month: req.body['endDate.month'],
        year: parseInt(req.body['endDate.year'])
      } : undefined,
      currentCTC: parseFloat(req.body.currentCTC),
      expectedCTC: parseFloat(req.body.expectedCTC),
      skills: req.body.skills,
      additionalInfo: req.body.additionalInfo
    };

    console.log('Processed application data:', applicationData);

    // Create and save the application
    const application = new Application(applicationData);
    await application.save();

    res.redirect(`/application-successful?firstName=${applicationData.firstName}&lastName=${applicationData.lastName}`);
  } catch (error) {
    console.error('Error processing application:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'You have already applied for this job.' });
    } else {
      res.status(500).json({ error: 'An error occurred while processing your application.' });
    }
  }
});



router.post('/application/update-status/:id', async (req, res) => {
  try {
    const applicationId = req.params.id;
    const newStatus = req.body.status;

    // Validate the new status
    const validStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find the application and update its status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Redirect to applications list or send a success response
    res.redirect('/admin-panel');
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'An error occurred while updating the application status.' });
  }
});








module.exports = router;
