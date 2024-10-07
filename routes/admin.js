const express = require('express');
const router = express.Router();
const JobPosting = require('../models/JobPosting');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');
const sendWhatsappMessage = require('../utils/whatsappSender');
const Templatesender = require("../utils/templatemailer");

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

router.post('/job/add', async (req, res) => {
  try {
    const { title, location, jobType, requirements, qualifications, description, responsibilities, skills, salary } = req.body;

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
      skills,
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
    const { title, location, jobType, requirements, qualifications, description, skills, responsibilities, salary } = req.body;

    // Convert requirements, qualifications, and responsibilities to arrays and filter out empty entries
    const requirementsArray = requirements ? requirements.split('\n').map(item => item.trim()).filter(item => item !== '') : null;
    const qualificationsArray = qualifications ? qualifications.split('\n').map(item => item.trim()).filter(item => item !== '') : null;
    const responsibilitiesArray = responsibilities ? responsibilities.split('\n').map(item => item.trim()).filter(item => item !== '') : null;

    // Description remains a string, but set it to null if empty
    const descriptionField = description ? description.trim() : null;


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
    job.description = descriptionField;
    job.responsibilities = responsibilitiesArray;
    job.salary = salary;
    job.skills = skills;

    await job.save(); // Save updated job data

    req.flash('success', 'Job is updated successfully');

    res.redirect('/admin-panel'); // Redirect to job listings page
  } catch (err) {
    req.flash('error', 'There is some error while Updating Job, please try again letter');

    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route to handle job status toggle
router.post('/job/toggle-status/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await JobPosting.findById(jobId); // Find the job by ID

    if (!job) {
      return res.status(404).send('Job not found');
    }

    // Toggle the job status
    job.status = job.status === 'open' ? 'closed' : 'open';
    await job.save(); // Save the updated job

    req.flash('success', `Job status changed to ${job.status} successfully`);
    res.redirect('/admin-panel'); // Redirect to admin panel after updating the status
  } catch (err) {
    console.error(err);
    req.flash('error', 'There was an error while updating the job status, please try again later');
    res.status(500).send('Server Error');
  }
});




router.post('/submit-application', upload.single('resume'), async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'jobId', 'jobName',
      'company', 'jobTitle', 'startDate.month', 'startDate.year', 'currentCTC', 'expectedCTC', 'skills'
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Validate phone number format
    const phonePattern = /^[0-9\s+()-]{10,20}$/;
    if (!phonePattern.test(req.body.phone)) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    // Create application data object
    const applicationData = {
      jobId: req.body.jobId,
      resume: req.file ? `/uploads/${req.file.filename}` : null,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobName: req.body.jobName,
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

    // Send WhatsApp message if the status is 'shortlisted'
    if (newStatus === 'shortlisted') {
      const { jobName, firstName, lastName, phone, email } = updatedApplication;
      const name = `${firstName} ${lastName}`;

      sendWhatsappMessage(
        phone,
        'shortlisted_candidates_ss',
        'Hello {{1}} ,Congratulations! We are pleased to inform you that you have been shortlisted for our interview process at shashisales.com Designation: { { 2 } } To schedule your interview at a time that works best for you, please click the link below and choose a convenient slot.',
        [name, jobName]
      );

      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Process and Scheduling Information</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #004a99;
            color: white;
            text-align: center;
            padding: 20px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }

        .content h2 {
            color: #004a99;
            font-size: 22px;
            margin-top: 0;
        }

        .content p {
            margin: 10px 0;
        }

        .content strong {
            color: #333333;
        }

        .button-container {
            text-align: center;
            margin-top: 20px;
        }

        .button {
            background-color: #004a99;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            color: #666666;
            font-size: 12px;
            background-color: #f4f4f4;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }

        .footer a {
            color: #004a99;
            text-decoration: none;
        }

        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
       
        <div class="header">
            <h1>Shashi Sales & Marketing</h1>
        </div>

        
        <div class="content">
            <h2>Congratulations, ${name}!</h2>
            <p>We are pleased to inform you that you have been shortlisted for the next stage of our interview process at <strong>Shashi Sales & Marketing</strong>. Congratulations!</p>

            <p><strong>Designation:</strong> ${jobName}</p>

            <h3>Interview Process</h3>
            <p>Our interview consists of three rounds, and each must be successfully cleared to qualify for the position:</p>
            <ol>
                <li><strong>Round 1: Discussion Round</strong> – We will discuss your skills, experience, and suitability for the role.</li>
                <li><strong>Round 2: Lab Session</strong> – A practical session to evaluate your technical abilities.</li>
                <li><strong>Round 3: HR & Documentation</strong> – Final round focusing on HR policies and document verification.</li>
            </ol>

            <h3>Scheduling Your Interview</h3>
            <p>To schedule your interview at a time convenient for you, please click the button below:</p>
            <div class="button-container">
                <a href="https://calendly.com/shashisales" class="button">Schedule Interview</a>
            </div>

            <h3>Rescheduling Policy</h3>
            <p>If you need to reschedule your interview, please make sure to do so at least <strong>4 hours</strong> before your scheduled time. Failure to do so may result in your application being rejected.</p>

            <p>We look forward to meeting you soon and wish you the best of luck in the interview process!</p>
        </div>

        
        <div class="footer">
            <p>Best regards,</p>
            <p><strong>Talent Acquisition</strong></p>
            <p><strong>Shashi Sales & Marketing</strong></p>
            <p><a href="mailto:info@shashisales.com">info@shashisales.com</a></p>
            <p><a href="http://www.shashisales.com">www.shashisales.com</a></p>
        </div>
    </div>
</body>
</html>
`;

      Templatesender(
      email,
        htmlTemplate,
        "Congratulations! Interview Process and Scheduling Information"
      );


    } else if (newStatus === "hired") {
      const { jobName, firstName, lastName, email } = updatedApplication;
      const name = `${firstName} ${lastName}`;



     const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Selection - Business Development Executive</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 15px; /* Reduced padding */
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #004a99;
            color: white;
            text-align: center;
            padding: 15px; /* Reduced padding */
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px; /* Slightly smaller font size */
        }

        .content {
            padding: 15px 10px; /* Reduced padding */
            line-height: 1.5; /* Adjusted line height for readability */
            color: #333333;
        }

        .content p {
            margin: 8px 0; /* Reduced margin */
        }

        .content strong {
            color: #333333;
        }

        .content ul {
            list-style: none;
            padding: 0;
        }

        .content ul li {
            margin-bottom: 8px; /* Reduced margin */
        }

        .footer {
            text-align: center;
            margin-top: 15px; /* Reduced margin */
            padding: 15px; /* Reduced padding */
            color: #666666;
            font-size: 12px;
            background-color: #f4f4f4;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }

        .footer a {
            color: #004a99;
            text-decoration: none;
        }

        .footer p {
            margin: 5px 0;
        }
        li{
          font-weight:bold;
          }

        /* Responsive styles */
        @media (max-width: 600px) {
        .content{
          padding-inline:6px;
        }
            .header h1 {
                font-size: 20px; /* Smaller font for mobile */
            }

            .content p {
                margin: 6px 0; /* Reduced margin for mobile */
            }

            .footer {
                font-size: 11px; /* Smaller footer text */
                padding: 10px; /* Reduced padding */
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>Shashi Sales & Marketing</h1>
        </div>

        <!-- Main Content -->
        <div class="content">
            <p>Dear ${name},</p>

            <p>We are pleased to inform you that you have been selected for the <strong>${jobName}</strong> position at <strong>Shashi Sales and Marketing</strong>. We were impressed by the skills and qualifications you demonstrated during the interview process.</p>

            <p>As a next step, please provide the following information and documents for verification and onboarding purposes:</p>

            <p><strong>Personal Information:</strong></p>
            <ul>
                <li>Legal Name: </li>
                <li>Primary Contact Number: </li>
                <li>Secondary Contact Number: </li>
                <li>Primary Email: </li>
                <li>Secondary Email: </li>
                <li>Current Address: </li>
                <li>Permanent Address: </li>
            </ul>

            <p><strong>Required Documents:</strong></p>
            <ul>
                <li>10th Marksheet and Certificate: </li>
                <li>10+2 Marksheet and Certificate: </li>
                <li>Graduation Marksheet and Certificate: </li>
                <li>Course Certification Proof (if applicable): </li>
                <li>Government-issued Photo ID (PAN Card, DL): </li>
                <li>Address Proof (Aadhaar Card, Passport): </li>
                <li>Passport-size Photo: </li>
                <li>Previous Company Experience Letter (if any): </li>
                <li>Last Three Months' Payslips (if withdrawn: )</li>
            </ul>

            <p><strong>Bank Account Details:</strong>: </p>
            <ul>
                <li>Account Holder Name: </li>
                <li>Bank Name & Address: </li>
                <li>Account Number: </li>
                <li>IFSC Code: </li>
            </ul>

            <p>Please reply all to this email while sending the documents as attachments. If you have any questions or concerns, feel free to contact me at <strong>+91-9773907203</strong>.</p>

            <p>Please note that this position does not include the provision of resources.</p>

            <p>We are excited to have you join our team and look forward to working with you. Kindly confirm your acceptance of this offer by replying all to this email within 24 hours.</p>

            <p>Congratulations once again, and welcome to <strong>Shashi Sales and Marketing!</strong></p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Thanks & Regards,</p>
            <p><strong>Srishti Tiwari</strong></p>
            <p><strong>Shashi Sales & Marketing</strong></p>
            <p><strong>+91-9773907203</strong></p>
            <p><a href="mailto:info@shashisales.com">info@shashisales.com</a></p>
            <p><a href="http://www.shashisales.com">www.shashisales.com</a></p>
        </div>
    </div>
</body>
</html>
`;



      Templatesender(
        email,
        htmlTemplate,
        "subject"
      );
    } else if (newStatus === "rejected") {
      const { jobName, firstName, lastName, email } = updatedApplication;
      const name = `${firstName} ${lastName}`;
      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #004a99;
            color: white;
            text-align: center;
            padding: 20px;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
        }

        .content p {
            margin: 10px 0;
        }

        .content strong {
            color: #333333;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding: 20px;
            color: #666666;
            font-size: 12px;
            background-color: #f4f4f4;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }

        .footer a {
            color: #004a99;
            text-decoration: none;
        }

        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        
        <div class="header">
            <h1>Shashi Sales & Marketing</h1>
        </div>

        
        <div class="content">
            <p>Dear Applicant,</p>

            <p>Thank you for taking the time to apply and interview for the position at <strong>Shashi Sales & Marketing</strong>. After careful consideration, we have decided to move forward with other candidates whose profiles more closely align with the job description.</p>

            <p>We appreciate your interest in joining our team and wish you success in your future endeavors.</p>
        </div>

        
        <div class="footer">
            <p>Best regards,</p>
            <p><strong>Talent Acquisition</strong></p>
            <p><strong>Shashi Sales & Marketing</strong></p>
            <p><a href="mailto:info@shashisales.com">info@shashisales.com</a></p>
            <p><a href="http://www.shashisales.com">www.shashisales.com</a></p>
        </div>
    </div>
</body>
</html>
`;
      Templatesender(
        email,
        htmlTemplate,
        `Congratulations on Your Selection as ${jobName}`
      );
    }

    // Redirect to applications list or send a success response
    res.redirect('/admin-panel');
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'An error occurred while updating the application status.' });
  }
});








module.exports = router;
