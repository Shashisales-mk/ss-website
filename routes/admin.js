const express = require('express');
const router = express.Router();
const JobPosting = require('../models/JobPosting');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');

const flash = require('connect-flash');

router.use(flash());


// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }
});


// Route to handle form submission
router.post('/job/add', async (req, res) => {
    try {
        const { title, location, jobType, requirements, qualifications, description, responsibilities, salary } = req.body;

        // Convert requirements and qualifications to arrays (as they are entered as text areas)
        const requirementsArray = requirements.split('\n').map(item => item.trim());
        const qualificationsArray = qualifications.split('\n').map(item => item.trim());
        const responsibilitiesArray = responsibilities.split('\n').map(item => item.trim());

        const newJob = new JobPosting({
            title,
            location,
            jobType,
            requirements: requirementsArray,
            qualifications: qualificationsArray,
            description,
            responsibilities : responsibilitiesArray,
            salary
        });

        await newJob.save(); // Save job to database
        req.flash('success', 'Job is added to queue successfully');
        res.redirect('/admin-panel'); // Redirect back to job listings page
    } catch (err) {
        console.error(err);
        req.flash('error', 'There is some error while adding Job, please try again letter');
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



router.post('/submit-application', upload.fields([{ name: 'resume' }, { name: 'coverLetter' }]), async (req, res) => {
    try {
        // Validate workExperience
        if (!Array.isArray(req.body.workExperience) || req.body.workExperience.length === 0) {
            return res.status(400).json({ error: 'At least one work experience is required.' });
        }

        // Helper function to ensure single value for month and year
        const ensureSingleValue = (value) => Array.isArray(value) ? value[0] : value;

        const applicationData = {
            jobId: req.body.jobId,
            resume: req.files['resume'][0].path,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            workExperience: req.body.workExperience.map(exp => ({
                ...exp,
                startDate: {
                    month: ensureSingleValue(exp.startDate.month),
                    year: ensureSingleValue(exp.startDate.year)
                },
                endDate: {
                    month: ensureSingleValue(exp.endDate.month),
                    year: ensureSingleValue(exp.endDate.year)
                },
                currentCTC: parseFloat(exp.currentCTC),
                expectedCTC: parseFloat(exp.expectedCTC)
            })),
            additionalInfo: req.body.additionalInfo,
            status: 'applied',
            appliedAt: new Date()
        };

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
        for (const field of requiredFields) {
            if (!applicationData[field]) {
                return res.status(400).json({ error: `${field} is required.` });
            }
        }

        // Validate work experience fields
        for (const exp of applicationData.workExperience) {
            const expRequiredFields = ['company', 'jobTitle', 'startDate', 'endDate', 'currentCTC', 'expectedCTC', 'skills'];
            for (const field of expRequiredFields) {
                if (!exp[field] || (typeof exp[field] === 'object' && (!exp[field].month || !exp[field].year))) {
                    return res.status(400).json({ error: `${field} is required for all work experiences.` });
                }
            }
        }

        const application = new Application(applicationData);
        await application.save();
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
