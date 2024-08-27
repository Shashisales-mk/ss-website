const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require('body-parser');
const ejsMate = require("ejs-mate");
const cors = require("cors");
const axios = require("axios");

const crypto = require('crypto');

const dotenv = require('dotenv');
const Templatesender = require("./utils/templatemailer");
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const multer = require('multer');
const fs = require('fs');
const User = require("./models/User");
const Blog = require('./models/Blog');
const Review = require('./models/Review');
const Gallery = require('./models/Gallery');
const Survey = require('./models/Servey');
const Question = require('./models/Question');
const Subscriber = require('./models/Subscribers');
const Testimonial = require('./models/Testimonial');
const Story = require('./models/TestimonialPage');
const Ad = require('./models/Ad');

const PaymentDetails = require('./models/PaymentDetails');
const Comment = require('./models/Comment');

const passport = require('./config/passport');

const { google } = require('googleapis');

const paypal = require('paypal-rest-sdk');


const galleryRoutes = require('./routes/galleryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const { gmail } = require("googleapis/build/src/apis/gmail");






// Configure PayPal SDK
paypal.configure({
    'mode': process.env.PAYPAL_MODE || 'live', // Make sure this is correct
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


const app = express();

main().then(() => {
    console.log("connected to the DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://shashisales:SS%40sales2604@213.210.21.176:27017/shashisales");
}




app.use(
    session({
        secret: 'shashisalesandmarketing',
        resave: false,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: 'mongodb://shashisales:SS%40sales2604@213.210.21.176:27017/shashisales',
            collectionName: 'sessions',
        }),
        cookie: {
            maxAge: 48 * 60 * 60 * 1000,
        },
    })
);


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Define the uploads directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');

// Multer setup (only for file uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const uploadFields = upload.fields([
    { name: 'blogBannerImage', maxCount: 1 },
    { name: 'showImg', maxCount: 1 },
    { name: 'contentMedia', maxCount: 2 } // Allow up to 2 media files for content
]);
// New middleware for single banner upload
const uploadSingleBanner = upload.single('newBanner');



app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(cors());
app.use(flash());

dotenv.config();






app.set('trust proxy', true); // Ensure Express trusts the proxy

app.use((req, res, next) => {
    // Determine the protocol based on X-Forwarded-Proto header or req.secure
    const protocol = req.get('X-Forwarded-Proto') || (req.secure ? 'https' : 'http');

    // Create the canonical URL
    const canonicalUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;


    // Pass the canonical URL to all templates
    res.locals.canonicalUrl = canonicalUrl;

    next();
});


// Routes
app.use('/', galleryRoutes);
app.use('/', testimonialRoutes);


// Authentication middleware
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.redirect('/login');
};



// Load client secrets from a local file.
// const credentials = require('./credentials.json');
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

// if (typeof privateKey === 'string') {
//     privateKey = privateKey.replace(/\\n/g, '\n');
//   } else {
//     console.error('GOOGLE_PRIVATE_KEY is not set or not a string');
//     privateKey = null; // or set a default value if appropriate
//   }

const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: privateKey.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
};


async function authenticate() {
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return await auth.getClient();
}

async function appendToSheet(auth, data) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1sAGLiARDBiDy-1a7PqNaCphH0SjppsTCJ1zC4ktVGyI';
    const range = 'Website Leads!A:F'; // Adjust range as needed
    const valueInputOption = 'RAW';

    let values = [];
    if (data.number) {
        // For /submit-quote-lead route
        const { countryCode, phoneNumber } = parsePhoneNumber(data.number);
        values = [Number(phoneNumber), new Date().toISOString(), '', '', '', Number(countryCode)];
    } else if (data.tel) {
        // For /submit-quote route
        const { countryCode, phoneNumber } = parsePhoneNumber(data.tel);
        values = [
            Number(phoneNumber),
            new Date().toISOString(),
            `${data.firstName} ${data.lastName}`,
            data.email,
            data.service,
            Number(countryCode)
        ];
    }

    const resource = {
        values: [values]
    };

    console.log('Data being appended to sheet:', JSON.stringify(resource.values, null, 2));

    try {
        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption,
            resource,
        });
        console.log(`${result.data.updates.updatedCells} cells appended.`);
        console.log('Append response:', JSON.stringify(result.data, null, 2));
    } catch (err) {
        console.error('Error appending to sheet:', err);
    }
}



function parsePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Always take the first two digits as the country code
    const countryCode = cleaned.slice(0, 2);
    const number = cleaned.slice(2);

    return {
        countryCode: countryCode,
        phoneNumber: number
    };
}










app.get("/", async (req, res) => {
    const blogs = await Blog.find({ isApprove: true }).sort({ createdAt: -1 });
    const testimonials = await Testimonial.find().populate('page');
    const successMessage = req.session.successMessage || null;
    const errorMessage = req.session.errorMessage || null;
    const ads = await Ad.find({ isActive: true }).sort({ uploadDate: -1 });
    console.log('successMessage:', successMessage); // Log the value of successMessage
    console.log('errorMessage:', errorMessage); // Log the value of errorMessage
    req.session.successMessage = null; // Clear the success message after displaying it
    req.session.errorMessage = null; // Clear the error message after displaying it
    res.render("home", {
        ads,
        successMessage,
        errorMessage,
        blogs,
        testimonials,
        truncateString,
        title: "Leading Website Development & Digital Marketing Services | Shashi Sales",
        description: "Shashi Sales and Marketing provides integrated digital business solutions including website development, advertising, Digital Marketing Services, UI/UX design, graphic and video design, product shoots, branding and PR.",
        keywords: "web development company, website design company, web design and development company, web design and development services, advertising, SEO, Web Development Company in India, web development India, Website desinger, web developer"
    });
});




app.get("/about-us", (req, res) => {
    res.render("aboutUs", {
        title: 'About us | Digital Marketing Agency | Shashi Sales ',
        description: 'Shashi Sales and Marketing offers expert digital marketing services to enhance online presence, boost engagement, and drive business growth.',
        keywords: 'Digital Marketing Agency'
    });
});

/////////////////////////////////////////////////////////////////////////////////////////

app.get("/web-development", (req, res) => {
    res.render("webDevelopment", {
        title: "Leading Website Development Companies - Shashi Sales ",
        description: "Get to know the top website development companies of 2024 and their innovative approaches to web development.",
        keywords: 'Website Development Companies'
    })
})

///////////////////////////////////////////////////////////////////////////////////////////////

app.get("/contact-us", (req, res) => {
    res.render("contact", {
        title: 'Contact us - Shashi Sales contact information',
        description: 'Reach out to Shashi Sales And Marketing to discuss your Integrated Digital Business Solutions needs. Discover the IT solutions tailored for your business.',
        keywords: 'Shashi Sales And Marketing'
    })
})

////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/fusion-marketing", async (req, res) => {
    const testimonials = await Testimonial.find().populate('page');
    res.render("advertisement", {
        testimonials,
        title: "Affiliate Marketing and off-page seo techniques-Fusion Marketing",
        description: "Shashi Sales and Marketing's fusion funnel approach is a comprehensive marketing strategy that integrates affiliate marketing, and SEO techniques.",
        keywords: 'Affiliate Marketing, off-page seo techniques'
    })
})

app.get("/cookie-policy", (req, res) => {
    res.render("cookiePolicy", {
        title: "Cookie Policy - Shashi Sales - Website Developer near me",
        description: "Find your local web development expert now. Get customized, professional website solutions that boost your online presence and growth. Call 1800-571-0605",
        keywords: 'Website Developer near me'
    })
})
app.get("/refund-policy", (req, res) => {
    res.render("refundPolicy", {
        title: "Refund Policy - Shashi Sales - Web Designers near me",
        description: "Local web designers can enhance your online presence with custom website designs tailored to your business. Discover experts, Call 1800-571-0605  today!",
        keywords: 'Web Designers near me'
    })
})


////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/terms-of-use", (req, res) => {
    res.render("terms", {
        title: "Term of Use - Shashi Sales - Website Development Company",
        description: "Choose the top e-commerce website development company in Delhi for powerful, scalable online stores.",
        keywords: 'Website Development Company'
    })
})


///////////////////////////////////////////////////////////////////////////////////////

app.get("/privacy-policy", (req, res) => {
    res.render("privacyPolicy", {
        title: "Privacy Policy - Shashi Sales - website development company",
        description: "Consult with Delhi’s best e-commerce website development experts for customized and effective online solutions.",
        keywords: 'Website Development Company'
    })
})

///////////////////////////////////////////////////////////////////////////////////////

app.get("/graphic-design", (req, res) => {
    res.render("design", {
        title: "Top-Rated Web Design Company in Delhi - Shashi Sales ",
        description: "Get Your Online Website In Just 7 Days Rank Your Website Amongst The Top website design Delhi Unlimited Graphic Designing and Video Designing.",
        keywords: 'Web Design Company in Delhi'
    })
})

/////////////////////////////////////////////////////////////////////////////////////

app.get("/email-marketing", (req, res) => {
    res.render("emailMarketing", {
        title: "Email Marketing Services in Delhi - Shashi Sales And Marketing",
        description: "Shashi Sales, Delhi's trusted email marketing company, offers affordable campaigns to boost your brand, sales, and conversions. Call 1800-571-0605 today!",
        keywords: 'Email Marketing Services in Delhi'
    })
})

///////////////////////////////////////////////////////////////////////////////////////

app.get("/seo", (req, res) => {
    res.render("seo", {
        title: "Leading SEO Company in Delhi-NCR & Best SEO Agency in Hyderabad | Shashi Sales",
        description: "Shashi Sales And Marketing - Explore the services of the top SEO experts in Delhi-NCR and the best SEO agency in Hyderabad, offering solutions for online success and increased traffic.",
        keywords: 'Best SEO Agency in Delhi-NCR & Hyderabad'
    })
});

app.get("/business-services", (req, res) => {
    res.render("businessServices", {
        title: "Digital Marketing Services in Delhi | Shashi Sales And Marketing ",
        description: "Shashi Sales offers digital marketing solutions to businesses across India, U.S. Contact us today to discover how our services can boost your business growth.",
        keywords: 'Digital Marketing Services in Delhi'
    })
});


app.get("/product-shoot", (req, res) => {
    res.render("photography", {
        title: "Product Shoot and Model Shoot Page | Shashi Sales And Marketing",
        description: "Shashi Sales offers Product and Model Shoot to entites across India, U.S. Contact Us today to discover how our services can boost your growth",
        keywords: 'Best Photography Service in Delhi'
    })
});





app.get("/hidden-img", (req, res) => {
    res.render("hidden")
})

app.get("/hidden-img2", (req, res) => {
    res.render("hidden2")
})

app.get("/review-form", (req, res) => {
    res.render("userTestiForm", {
        title: "",
        description: "",
        keywords: " "
    })
})


app.get("/check-user-story/:id", async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.json({ hasStory: false });
        }

        const testimonialPage = await Story.findOne({ testimonial: testimonial._id });
        res.json({ hasStory: !!testimonialPage });
    } catch (error) {
        console.error('Error checking case study:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/user-story/:id", async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).render('error', { message: 'Testimonial not found' });
        }

        const testimonialPage = await Story.findOne({ testimonial: testimonial._id });
        if (!testimonialPage) {
            return res.status(404).render('error', { message: 'Testimonial page details not found' });
        }

        const story = {
            successStory: testimonialPage.successStory,
            growthStory: testimonialPage.growthStory,
            caseStudy: testimonialPage.caseStudy,
            problemStatement: testimonialPage.problemStatement,
            clientOverview: testimonialPage.clientOverview,
            challenges: testimonialPage.challenges,
            objectives: testimonialPage.objectives,
            solution: testimonialPage.solution,
            result: testimonialPage.result,
            conclusion: testimonialPage.conclusion
        };

        res.render("userStory", {
            story,
            title: testimonial.title || "",
            description: testimonial.description || "",
            keywords: " "
        });
    } catch (error) {
        console.error('Error fetching case study:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
});


function truncateString(str, length = 200) {
    if (str.length > length) {
        return `${str.substring(0, length)}...`;
    }
    return str;
}

app.get("/blog", async (req, res) => {
    try {
        const blogs = await Blog.find({ isApprove: true }).sort({ createdAt: -1 });
        console.log(blogs.canonical);
        res.render("blog", {
            blogs,
            truncateString,
            title: "Draggan AI  Revolutionizing Workflow Optimization - Shashi Sales",
            description: "Discover how Draggan AI is revolutionizing workflow optimization. Explore its powerful capabilities in automating tasks and enhancing efficiency across projects.",
            keywords: 'Draggan AI'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/blog-form", (req, res) => {
    res.render("uploadForm", {
        title: "Blog Form - Seo Company in Delhi-NCR India - Shashi Sales",
        description: "Boost your online presence with Shashi Sales and Marketing, the top SEO company in Delhi-NCR India. Drive traffic and enhance your brand visibility today!",
        keywords: 'Draggan Website'
    });
});



app.get("/blog-detail/:canonical", async (req, res) => {
    try {
        const { canonical } = req.params;
        const blog = await Blog.findOne({ canonical: canonical.trim() });
        const subscriptionMessage = req.query.subscriptionMessage || null;

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        const approvedComments = await Comment.find({ blog: blog._id, isApproved: true });
        const ads = await Ad.find({ isActive: true }).sort({ uploadDate: -1 });
        res.render("blogDetails", {
            ads,
            blog, subscriptionMessage,
            comments: approvedComments,
            title: blog.metaTitle,
            description: blog.metaDescription,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/subscribe', async (req, res) => {
    try {
        const { name, email, redirectUrl } = req.body;

        // Check if the email already exists
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            req.flash('error', 'This email is already subscribed.');
            return res.redirect(redirectUrl);
        }

        // Create a new subscriber
        const newSubscriber = new Subscriber({ name, email });
        await newSubscriber.save();

        req.flash('success', 'Subscription successful!');
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error subscribing:', error);
        req.flash('error', 'Failed to subscribe. Please try again.');
        res.redirect(redirectUrl);
    }
});


app.delete('/delete-subscriber/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

        if (!deletedSubscriber) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }

        res.redirect("/all-blogs-list");
    } catch (err) {
        console.error('Error deleting subscriber:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid subscriber ID' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Route for handling blog upload
app.post('/upload-blog', uploadFields, async (req, res) => {
    try {
        const { authorName, authorEmail, blogTitle, blogShortDesc, headings, paragraphs, metaTitle, metaDescription, metaKeywords, canonical } = req.body;
        const bannerImage = req.files['blogBannerImage'] ? req.files['blogBannerImage'][0] : null;
        const showImg = req.files['showImg'] ? req.files['showImg'][0] : null;
        const images = req.files['images'] ? req.files['images'].map(img => `/uploads/${img.filename}`) : [];
        const subscribers = await Subscriber.find();
        const contentMedia = req.files['contentMedia'] || [];

        if (!bannerImage) {
            throw new Error('B-blog-listlog banner image is required');
        }
        if (!showImg) {
            throw new Error('B-blog-listlog banner image is required');
        }

        const content = [];
        const headingsArray = Array.isArray(headings) ? headings : [headings];
        const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];

        for (let i = 0; i < headingsArray.length; i++) {
            const mediaFile = contentMedia[i];
            content.push({
                heading: headingsArray[i],
                paragraph: paragraphsArray[i],
                media: mediaFile ? {
                    type: `/uploads/${mediaFile.filename}`,
                    mediaType: mediaFile.mimetype.startsWith('image/') ? 'image' : 'video'
                } : null
            });
        }

        const contentText = req.body.contentText.replace(/<\/?[^>]+(>|$)/g, '');


        const blog = new Blog({
            name: authorName,
            email: authorEmail,
            title: blogTitle,
            shortDescription: blogShortDesc,
            bannerImage: `/uploads/${bannerImage.filename}`,
            showImg: `/uploads/${showImg.filename}`,
            content,
            metaTitle,
            canonical,
            contentText,
            metaDescription,
            metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()),
            isLatest: true,
            isPopular: false,
            isApprove: false
        });

        await blog.save();


        // Fetch 3 suggested blog posts
        const suggestedBlogs = await Blog.find({ _id: { $ne: blog._id } })
            .sort({ createdAt: -1 })
            .limit(3);

        for (const subscriber of subscribers) {
            const imageUrl = blog.bannerImage.startsWith('https' || 'http')
                ? blog.bannerImage
                : `https://shashisales.com${blog.bannerImage}`;

            const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Blog Post: ${blog.title}</title>
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  h1, h2 {
    color: #2c3e50;
  }
  a {
    color: #3498db;
    text-decoration: none;
  }
  .cta-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #3498db;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 15px;
  }
  .suggested-blogs {
    margin-top: 30px;
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
  }
  .suggested-blog {
    margin-bottom: 20px;
  }
</style>
</head>
<body>
<img src="${imageUrl}" alt="Banner Image">
<h1>${blog.title}</h1>
<p>${blog.shortDescription}</p>
<a href="https://shashisales.com/blog-detail/${blog.canonical}" class="cta-button">Read More</a>

<div class="suggested-blogs">
  <h2>Suggested Posts</h2>
  ${suggestedBlogs.map(suggestedBlog => `
    <div class="suggested-blog">
      <h3><a href="https://shashisales.com/blog-detail/${suggestedBlog.canonical}">${suggestedBlog.title}</a></h3>
      <p>${suggestedBlog.shortDescription.substring(0, 100)}...</p>
    </div>
  `).join('')}
</div>
</body>
</html>
    `;

            await Templatesender(
                [subscriber.email],
                htmlTemplate,
                "New Blog Post: " + blog.title
            );
        }



        console.log(blog);
        // res.status(200).send('Blog uploaded successfully!');
        res.redirect("/blog")
    } catch (error) {
        console.error('Error uploading blog:', error);
        res.status(500).send('Failed to upload blog. Please try again.');
    }
});





// Route to update all blog banner 
app.post('/update-all-blog-banners', uploadSingleBanner, isAdmin, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No banner image uploaded.');
        }

        const newBannerPath = `/uploads/${req.file.filename}`;

        // Update all blog documents
        const updateResult = await Blog.updateMany(
            {}, // Empty filter to match all documents
            { $set: { bannerImage: newBannerPath } }
        );

        res.json({
            message: 'All blog banner images updated successfully',
            newBannerPath: newBannerPath,
            updatedCount: updateResult.modifiedCount
        });
    } catch (error) {
        console.error('Error updating blog banners:', error);
        res.status(500).send('An error occurred while updating blog banners');
    }
});




app.get("/all-blogs-list", isAdmin, async (req, res) => {
    const AllBlogs = await Blog.find();
    const galleryItems = await Gallery.find();
    const category = await Gallery.find();
    const testimonials = await Testimonial.find().populate('page');
    const pendingComments = await Comment.find({ isApproved: false }).populate('blog', 'title');
    const approvedComments = await Comment.find({ isApproved: true }).populate('blog', 'title');
    const ads = await Ad.find({ isActive: true }).sort({ uploadDate: -1 });
    const subscribers = await Subscriber.find();

    // console.log(AllBlogs);
    res.render("allBlogs", {
        ads,
        acomments: approvedComments,
        comments: pendingComments,
        testimonials,
        galleryItems,
        category,
        AllBlogs,
        title: "All Blog List - how to create a website - Shashi Sales",
        description: "Learn how to create a website with our step-by-step guide for beginners. This comprehensive tutorial covers everything you need to build your site from scratch.",
        keywords: 'how to create a website',
        subscribers
    })
})

app.delete('/delete-blog/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return res.status(404).send('Blog not found');
        }

        res.redirect("/all-blogs-list");
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/edit-blog/:canonical', isAdmin, async (req, res) => {
    try {
        const { canonical } = req.params;
        const blog = await Blog.findOne({ canonical: canonical });


        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        res.render('blogEdit', {
            blog, title: "blog edit  ",
            description: " blog edit page"
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




app.put('/update-blog/:id', uploadFields, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { authorName, authorEmail, blogTitle, blogShortDesc, headings, paragraphs, metaTitle, metaDescription, metaKeywords, canonical, contentText, isLatest, isPopular, isApprove } = req.body;

        const subscribers = await Subscriber.find();

        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).send('Blog not found');
        }

        let bannerImagePath = existingBlog.bannerImage;
        if (req.files['blogBannerImage'] && req.files['blogBannerImage'][0]) {
            bannerImagePath = `/uploads/${req.files['blogBannerImage'][0].filename}`;
        }
        let showImgPath = existingBlog.showImg;
        if (req.files['showImg'] && req.files['showImg'][0]) {
            showImgPath = `/uploads/${req.files['showImg'][0].filename}`;
        }

        const images = req.files['images'] ? req.files['images'].map(img => `/uploads/${img.filename}`) : existingBlog.content.map(item => item.image);

        const content = [];
        for (let i = 0; i < headings.length; i++) {
            content.push({
                heading: headings[i],
                paragraph: paragraphs[i],
                image: images[i] || null
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, {
            name: authorName,
            email: authorEmail,
            title: blogTitle,
            shortDescription: blogShortDesc,
            bannerImage: bannerImagePath,
            showImg: showImgPath,
            content,
            metaTitle,
            canonical,
            contentText,
            metaDescription,
            metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()),
            isLatest: isLatest === 'true',
            isPopular: isPopular === 'false',
            isApprove: isApprove === 'false',
        }, { new: true });

        // Fetch 3 suggested blog posts
        const suggestedBlogs = await Blog.find({ _id: { $ne: updatedBlog._id } })
            .sort({ createdAt: -1 })
            .limit(3);

        for (const subscriber of subscribers) {
            const imageUrl = updatedBlog.bannerImage.startsWith('https' || 'http')
                ? updatedBlog.bannerImage
                : `https://shashisales.com${updatedBlog.bannerImage}`;

            const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New Blog Post: ${updatedBlog.title}</title>
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  h1, h2 {
    color: #2c3e50;
  }
  a {
    color: #3498db;
    text-decoration: none;
  }
  .cta-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #3498db;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 15px;
  }
  .suggested-blogs {
    margin-top: 30px;
    border-top: 1px solid #e0e0e0;
    padding-top: 20px;
  }
  .suggested-blog {
    margin-bottom: 20px;
  }
</style>
</head>
<body>
<img src="${imageUrl}" alt="Banner Image">
<h1>${updatedBlog.title}</h1>
<p>${updatedBlog.shortDescription}</p>
<a href="https://shashisales.com/blog-detail/${updatedBlog.canonical}" class="cta-button">Read More</a>

<div class="suggested-blogs">
  <h2>Suggested Posts</h2>
  ${suggestedBlogs.map(suggestedBlog => `
    <div class="suggested-blog">
      <h3><a href="https://shashisales.com/blog-detail/${suggestedBlog.canonical}">${suggestedBlog.title}</a></h3>
      <p>${suggestedBlog.shortDescription.substring(0, 100)}...</p>
    </div>
  `).join('')}
</div>
</body>
</html>
    `;

            await Templatesender(
                [subscriber.email],
                htmlTemplate,
                "Updated Blog Post: " + updatedBlog.title
            );
        }
        res.redirect("/all-blogs-list");
    } catch (err) {
        console.error('Error updating blog:', err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
});


// popular button routes

app.post('/toggle-popular/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        blog.isPopular = !blog.isPopular;
        await blog.save();

        res.redirect('/all-blogs-list');
    } catch (err) {
        console.error('Error toggling popular status:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Approve button routes

app.post('/toggle-approve/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        blog.isApprove = !blog.isApprove;
        await blog.save();

        res.redirect('/all-blogs-list');
    } catch (err) {
        console.error('Error toggling popular status:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Route for handling ads upload
app.post('/uploadAd', upload.single('ad'), async (req, res) => {
    const { title } = req.body;
    const newAd = new Ad({
        filePath: `/uploads/${req.file.filename}`,
        title
    });

    try {
        await newAd.save();
        res.redirect('/all-blogs-list');
    } catch (err) {
        res.status(500).send('Error saving ad');
    }
});
app.post('/delete-ads', async (req, res) => {
    const adIds = req.body.adIds;

    if (!adIds || adIds.length === 0) {
        return res.redirect('/admin');
    }

    try {
        const adsToDelete = await Ad.find({ _id: { $in: adIds } });

        adsToDelete.forEach(ad => {
            const filePath = `./public${ad.filePath}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Ad.deleteMany({ _id: { $in: adIds } });

        res.redirect('/all-blogs-list');
    } catch (err) {
        console.error('Error deleting ads:', err);
        res.status(500).send('Error deleting ads');
    }
});



// New route to handle comment submission
app.post("/blog-detail/:canonical/comment", async (req, res) => {
    try {
        const { canonical } = req.params;
        const { name, email, comment } = req.body;

        const blog = await Blog.findOne({ canonical: canonical });

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        if (!name || !email || !comment) {
            return res.status(404).send("please fill all the details")
        }

        const newComment = new Comment({
            name,
            email,
            comment,
            blog: blog._id,
            isApproved: false
        });

        await newComment.save();

        res.redirect(`/blog-detail/${canonical}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/admin/approve-comment/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.commentId, { isApproved: true });
        res.redirect('/all-blogs-list');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error approving comment');
    }
});

app.post('/admin/delete-comment/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.redirect('/all-blogs-list');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting comment');
    }
});



//   const recipients = ['suryakantgupta678@gmail.com', 'bgmilelomujhse@gmail.com'];
const recipients = ['anurag.tiwari@shashisales.com', 'info@shashisales.com'];







app.post('/submit-quote', async (req, res) => {
    const formData = req.body;
    const referrerUrl = req.get('Referrer') || '/';

    // Server-side validation
    if (!formData.firstName || !formData.lastName || !formData.tel || !formData.email || !formData.service) {
        req.session.errorMessage = 'All fields are required';
        return res.redirect(referrerUrl);
    }

    if (!/^[A-Za-z ]+$/.test(formData.firstName) || !/^[A-Za-z ]+$/.test(formData.lastName)) {
        req.session.errorMessage = 'Names should only contain letters and spaces';
        return res.redirect(referrerUrl);
    }

    // Remove non-digit characters for length check
    const phoneDigits = formData.tel.replace(/[^\d+]/g, '');

    if (phoneDigits.length < 8) {
        req.session.errorMessage = 'Please enter a valid phone number with valid format of your country';
        return res.redirect(referrerUrl);
    }

    // Simple phone validation (allows digits, spaces, hyphens, and parentheses)
    if (!/^\+[\d\s\-()]+$/.test(formData.tel)) {
        req.session.errorMessage = 'Phone number should only contain digits, spaces, hyphens, or parentheses';
        return res.redirect(referrerUrl);
    }


    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        req.session.errorMessage = 'Please enter a valid email address';
        return res.redirect(referrerUrl);
    }

    const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shashi sales and marketing</title>
        <style>
        .main-page{
            height: 100vh;
            width: 100%;
            position: relative;
        }
        .details{
            width: 350px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgb(239, 229, 229);
            padding: 3rem 1.5rem;
            
        }

        .details h1{
            font-size: 1.5rem;


        }
        


    </style>
    </head>
    
    <body>
        <div class="main-page">
            <div class="details">
                <h1>New Lead Notification</h1>
                <br>
                <p id="Full name"><b>Name :</b> ${formData.firstName} ${formData.lastName}</p>
                <br>
                <p class="phone-number"><b>Number :</b> ${formData.tel}</p> <br>
                <p class="email"><b>Email :</b> ${formData.email}</p> <br>
                <p class="service"><b>Service :</b> ${formData.service}</p> <br>
            </div>
            </div>
    
                    
    </body>
    
    </html>`



    try {
        console.log('Received form data:', formData);
        // mailsender(formData, recipients);
        Templatesender(recipients, htmlTemplate, "You Got New Lead");
        Templatesender("bgmilelomujhse@gmail.com", htmlTemplate, "You Got New Lead");

        const authClient = await authenticate();
        // Append data to Google Sheets
        await appendToSheet(authClient, formData);
        req.session.successMessage = 'Thank you for your interest in Shashi sales and marketing, we will get back to you soon';
        res.redirect(referrerUrl);
    } catch (error) {
        console.error('Failed to send email:', error);
        req.session.errorMessage = 'An error occurred while submitting your form. Please try again later.';
        res.redirect(referrerUrl);
    }
});

app.post('/submit-quote-lead', async (req, res) => {
    const formData = req.body;
    const referrerUrl = req.get('Referrer') || '/';

    // Remove non-digit characters for length check
    const phoneDigits = formData.number.replace(/\D/g, '');

    if (phoneDigits.length < 7) {
        req.session.errorMessage = 'Please enter a valid phone number with valid format of your country';
        return res.redirect(referrerUrl);
    }

    // Simple phone validation (allows digits, spaces, hyphens, and parentheses)
    if (!/^[\d\s\-()]+$/.test(formData.number)) {
        req.session.errorMessage = 'Phone number should only contain digits, spaces, hyphens, or parentheses';
        return res.redirect(referrerUrl);
    }

    const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shashi sales and marketing</title>
        <style>
            .main-page{
                height: 100vh;
                width: 100%;
                position: relative;
            }
            .details{
                width: 350px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgb(239, 229, 229);
                padding: 3rem 1.5rem;
                
            }
    
            .details h1{
                font-size: 1.5rem;
   
    
            }
            
    
    
        </style>
    </head>
    
    <body>
        <div class="main-page">
            <div class="details">
                <h1>New Lead Notification</h1>
            
               <br>
                
                <p class="phone-number"><b>Number :</b> ${formData.number}</p>
                <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
               
            </div>
            </div>
    
                    
    </body>
    
    </html>`

    try {
        console.log('Received form data:', formData);
        // mailsender(formData, recipients);
        Templatesender(recipients, htmlTemplate, "You Got New Lead");
        Templatesender("bgmilelomujhse@gmail.com", htmlTemplate, "You Got New Lead");

        const authClient = await authenticate();
        // Append data to Google Sheets
        await appendToSheet(authClient, formData);





        req.session.successMessage = 'Thank you for your interest in Shashi sales and marketing, we will get back to you soon';
        res.redirect(referrerUrl);
    } catch (error) {
        console.error('Failed to send email:', error);
        req.session.errorMessage = 'An error occurred while submitting your form. Please try again later.';
        res.redirect(referrerUrl);
    }
});





// servey code


app.get('/survey', async (req, res) => {
    try {
        const questions = await Question.find();
        const questionNumber = parseInt(req.query.q) || 1;
        const question = questions[questionNumber - 1];

        // Replace placeholders with actual values
        let questionText = question.text;
        if (question.placeholders && question.placeholders.length > 0) {
            question.placeholders.forEach(placeholder => {
                const value = req.session[placeholder] || `{${placeholder}}`;
                questionText = questionText.replace(new RegExp(`{${placeholder}}`, 'g'), value);
            });
        }

        res.render('servey', {
            questionNumber,
            question: { ...question.toObject(), text: questionText },
            totalQuestions: questions.length,
            title: " ",
            description: " ",
            keywords: " "
        });
    } catch (error) {
        res.status(500).send('An error occurred while fetching questions');
    }
});

app.post('/submit', async (req, res) => {
    const { questionId, answer } = req.body;
    const questionNumber = parseInt(req.body.questionNumber);



    try {
        const questions = await Question.find();
        let survey = await Survey.findOne({ _id: req.session.surveyId });

        if (!survey) {
            survey = new Survey({
                answers: [],
                serialBias: Math.floor(Math.random() * questions.length) + 1
            });
            req.session.surveyId = survey._id;
        }

        const existingAnswerIndex = survey.answers.findIndex(a => a.question.toString() === questionId);
        if (existingAnswerIndex > -1) {
            survey.answers[existingAnswerIndex].answer = answer;
        } else {
            survey.answers.push({ question: questionId, answer });
        }

        await survey.save();

        // Store only firstname and company in the session
        if (questionNumber === 1) {
            req.session.firstname = answer;
        } else if (questionNumber === 3) {
            req.session.company = answer;
        }

        if (questionNumber < questions.length) {
            res.redirect(`/survey?q=${questionNumber + 1}`);
        } else {

            const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Survey Submission</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            .survey-info {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 15px;
              margin-top: 20px;
            }
            .question {
              margin-bottom: 15px;
            }
            .question-text {
              font-weight: bold;
              color: #2980b9;
            }
            .answer {
              margin-top: 5px;
            }
            
          </style>
        </head>
        <body>
          <h1>New Survey Submission</h1>
          <p>A client has submitted a new survey. Here are the details:</p>
          <div class="survey-info">
            ${survey.answers.map(a => `
              <div class="question">
                <div class="question-text">Q - ${questions.find(q => q._id.toString() === a.question.toString()).text}</div>
                <div class="answer">A - ${a.answer}</div>
                <br>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;

            Templatesender(recipients, htmlTemplate, "A client has submitted the survey");
            res.redirect('/thank-you');
        }
    } catch (error) {
        res.status(500).send('An error occurred while saving the survey');
    }
});

app.get('/thank-you', (req, res) => {

    res.render('thank-you', {
        redirectUrl: "/"
    });


});
// servey code








// admin panel code 
async function createDefaultAdminUsers() {
    try {
        // Check if any admin or manager users exist
        const existingAdmins = await User.find({ role: 'admin' });


        if (existingAdmins.length > 0) {
            console.log('Admin user already exist');
            return;
        }

        // Check if environment variables are set
        if (!process.env.ADMIN_PASS || !process.env.ADMIN_EMAIL) {
            throw new Error('Environment variables MANAGER_PASS, ADMIN_PASS, and ADMIN_EMAIL must be set');
        }




        const adminUser = new User({
            name: 'Admin User',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASS, // await the hashed password
            role: 'admin'
        });

        await adminUser.save();

        console.log('Default admin created successfully');
    } catch (err) {
        console.error('Error creating default admin and manager users:', err);
    }
}
// Call the function to create the default admin users
//   createDefaultAdminUsers();


app.get('/login', (req, res) => {
    const { successMessage, errorMessage } = req.flash();
    res.render('login', {
        successMessage,
        errorMessage,
        title: "Login | Top Companies in Digital Marketing: Boost Your Online Presence | Shashi Sales",
        description: "Discover the top companies in digital marketing that can help elevate your online presence, drive traffic, and increase your business's success in the digital age.",
        keywords: 'Top Companies in Digital Marketing'
    });
});

app.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    }),
    (req, res) => {
        const { role } = req.user;
        if (role === 'admin') {
            res.redirect('/all-blogs-list'); // Redirect to admin panel
        } else {
            res.redirect('/login'); // Redirect to home page
        }
    }
);


app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/login', {
            title: " logout page",
            description: " logout page"
        });
    });
});





//   payment gateway integration




app.get("/phonepe-payment-page", async (req, res) => {
    res.render("phonepayForm", {
        title: "Digital marketing companies kochi - Shashi Sales And Marketing ",
        description: "Shashi Sales, Access the best digital marketing services tailored for businesses in Kochi to maximize their online potential. Call Call 1800-571-0605 today!",
        keywords: 'Digital marketing companies kochi'
    })
})

app.post("/payment", async (req, res) => {
    try {
        const { name, number, amount, email } = req.body;
        const merchantTransactionId = 'T' + Date.now();


        const paymentDetails = new PaymentDetails({
            merchantTransactionId,
            name,
            number,
            email,
            amount
        });
        await paymentDetails.save();


        const data = {
            "merchantId": process.env.PHONEPE_MERCHANT_ID,
            "merchantTransactionId": merchantTransactionId,
            "merchantUserId": process.env.PHONEPE_MERCHANT_UID,

            "amount": amount * 100,
            "redirectUrl": `https://www.shashisales.com/status/${merchantTransactionId}`,
            // "redirectUrl": `http://localhost:4000/status/${merchantTransactionId}`,
            "redirectMode": "POST",
            "mobileNumber": number,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const key = process.env.PHONEPE_SALT;
        const keyIndex = process.env.PHONEPE_KEY_INDEX;
        const stringToHash = payloadMain + '/pg/v1/pay' + key;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + '###' + keyIndex;
        const URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

        const options = {
            method: 'post',
            url: URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            data: {
                request: payloadMain
            }
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);



                res.redirect(response.data.data.instrumentResponse.redirectInfo.url)

            })
            .catch(function (error) {
                console.error(error);
            });



    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            headers: error.response?.headers,
            data: error.response?.data,
        });
        res.status(500).send({
            message: error.message,
            success: false,
            details: error.response?.data || 'No additional details available'
        });
    }
});





app.post("/status/:txnId", async (req, res) => {
    console.log("Received status callback for txnId:", req.params.txnId);
    console.log("Request body:", req.body);

    const merchantTransactionId = req.body.transactionId;

    try {
        // Retrieve payment details from database
        const paymentDetails = await PaymentDetails.findOne({ merchantTransactionId });

        if (!paymentDetails) {
            console.error("Payment details not found for transaction:", merchantTransactionId);
            return res.redirect("/phonepe-payment-page");
        }

        const { name, number, amount, email } = paymentDetails;

        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const key = process.env.PHONEPE_SALT;
        const keyIndex = process.env.PHONEPE_KEY_INDEX;
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${key}`;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + keyIndex;

        console.log("Generated checksum:", checksum);

        const URL = `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`;
        console.log("Requesting URL:", URL);

        const options = {
            method: 'GET',
            url: URL,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            },
        };

        const response = await axios.request(options);
        console.log("PhonePe API Response:", response.data);

        if (response.data.success === true) {
            console.log("Payment successful, sending emails and redirecting to success page");

            // Update payment status in database
            paymentDetails.status = 'completed';
            await paymentDetails.save();

            const htmlTemplate = `
                <!DOCTYPE html>
             <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Shashi sales and marketing</title>

                    <style>
            ._failed {
            border-bottom: solid 4px red !important;
            }

        ._failed i {
            color: red !important;
        }

        .bl {
            background-color: black;
        }

        .container {
            width: 100%;
            margin-top: 6rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        ._success {
            box-shadow: 0 15px 25px #00000019;
            padding: 45px;
            width: 100%;
            text-align: center;
            margin: 40px auto;
            border-bottom: solid 4px #28a745;
        }

        ._success i {
            font-size: 55px;
            color: #28a745;
        }

        ._success h2 {
            margin-bottom: 12px;
            font-size: 40px;
            font-weight: 500;
            line-height: 1.2;
            margin-top: 10px;
        }

        ._success p {
            margin-bottom: 20px;
            font-size: 18px;
            color: #495057;
            font-weight: 500;
        }
        a{
            color: blue;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: underline;
           
        }
        h3{
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        span{
            font-size: 2rem;
            color: #28a745;
        }
        @media screen and (max-width:400px) {
            ._success{
                padding: 20px;
                width: 95%;
            }
        }
    </style>
</head>
<body>
    <style>
        ._failed {
            border-bottom: solid 4px red !important;
        }

        ._failed i {
            color: red !important;
        }

        .bl {
            background-color: black;
        }

        .container {
            width: 100%;
            margin-top: 6rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        ._success {
            box-shadow: 0 15px 25px #00000019;
            padding: 45px;
            width: 100%;
            text-align: center;
            margin: 40px auto;
            border-bottom: solid 4px #28a745;
        }

        ._success i {
            font-size: 55px;
            color: #28a745;
        }

        ._success h2 {
            margin-bottom: 12px;
            font-size: 40px;
            font-weight: 500;
            line-height: 1.2;
            margin-top: 10px;
        }

        ._success p {
            margin-bottom: 20px;
            font-size: 18px;
            color: #495057;
            font-weight: 500;
        }
        a{
            color: blue;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: underline;
           
        }
        h3{
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        span{
            font-size: 2rem;
            color: #28a745;
        }
    </style>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="message-box _success">
                    <i class="fa fa-check-circle" aria-hidden="true"></i>
                    <h2> Your payment was successful </h2>
                    <h3>Amount paid: <span>₹${amount}</span></h3>
                    <p> Thank you ${name} for your payment. we will <br>
                        be in contact with more details shortly </p>
                </div>
            </div>
        </div>


    </div>
</body>
</html>
          `

            Templatesender(email, htmlTemplate, "Thank you from shashi sales and marketing");


            const htmlTemplate2 = `
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shashi sales and marketing</title>

    <style>
        ._failed {
            border-bottom: solid 4px red !important;
        }

        ._failed i {
            color: red !important;
        }

        .bl {
            background-color: black;
        }

        .container {
            width: 100%;
            margin-top: 6rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        ._success {
            box-shadow: 0 15px 25px #00000019;
            padding: 45px;
            width: 100%;
            text-align: center;
            margin: 40px auto;
            border-bottom: solid 4px #28a745;
        }

        ._success i {
            font-size: 55px;
            color: #28a745;
        }

        ._success h2 {
            margin-bottom: 12px;
            font-size: 40px;
            font-weight: 500;
            line-height: 1.2;
            margin-top: 10px;
        }

        ._success p {
            margin-bottom: 20px;
            font-size: 18px;
            color: #495057;
            font-weight: 500;
        }
        a{
            color: blue;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: underline;
           
        }
        h3{
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        span{
            font-size: 2rem;
            color: #28a745;
        }
        @media screen and (max-width:400px) {
            ._success{
                padding: 20px;
                width: 95%;
            }
        }
    </style>
</head>
<body>
    <style>
        ._failed {
            border-bottom: solid 4px red !important;
        }

        ._failed i {
            color: red !important;
        }

        .bl {
            background-color: black;
        }

        .container {
            width: 100%;
            margin-top: 6rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }


        ._success {
            box-shadow: 0 15px 25px #00000019;
            padding: 45px;
            width: 100%;
            text-align: center;
            margin: 40px auto;
            border-bottom: solid 4px #28a745;
        }

        ._success i {
            font-size: 55px;
            color: #28a745;
        }

        ._success h2 {
            margin-bottom: 12px;
            font-size: 40px;
            font-weight: 500;
            line-height: 1.2;
            margin-top: 10px;
        }

        ._success p {
            margin-bottom: 20px;
            font-size: 18px;
            color: #495057;
            font-weight: 500;
        }
        a{
            color: blue;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: underline;
           
        }
        h3{
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        span{
            font-size: 2rem;
            color: #28a745;
        }
    </style>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-5">
                <div class="message-box _success">
                    <i class="fa fa-check-circle" aria-hidden="true"></i>
                    <h2> You got payment from ${name} </h2>
                    <h3>Amount paid: <span>₹${amount}</span></h3>
                    <p> User detail : 
                    </p>
                    <p>Name : ${name} </p>
                    <p>Number : ${number} </p>
                    <p>Email : ${email}</p>
                </div>
            </div>
        </div>


    </div>
</body>
</html>
          `
            Templatesender("info@shashisales.com", htmlTemplate2, "Payment INfo")

            // If payment is successful, redirect to payment-successful page with additional query parameters
            return res.redirect(`/payment-successful?amount=${amount}&email=${email}&number=${number}`);
        } else {
            console.log("Payment unsuccessful, redirecting to form");

            // Update payment status in database
            paymentDetails.status = 'failed';
            await paymentDetails.save();

            return res.redirect("/payment-failed");
        }
    } catch (error) {
        console.error("Error in PhonePe status check:", error);
        return res.redirect("/phonepe-payment-page");
    }
});

app.get("/payment-successful", (req, res) => {
    const amount = req.query.amount || 'N/A';
    const email = req.query.email || 'N/A';
    const number = req.query.number || 'N/A';

    res.render("paymentsucess.ejs", {
        amount: amount,
        email: email,
        number: number,
        title: "Payment Successful",
        description: "Your payment was successful",
        keywords: 'Digital marketing companies'
    });
});


app.get("/payment-failed", (req, res) => {
    res.render("paymentfail.ejs", {
        title: "payment failed ",
        description: " payment failed page",
        keywords: 'Digital marketing companies'
    })
})


app.get("/pay-via-paypal", (req, res) => {
    res.render("paypalPaymentForm", {
        title: "Pay via paypal | Shashi Sales And Marketing",
        description: "Shashi Sales and Marketing offers innovative solutions to transform your business, boost customer loyalty, and stay ahead of the competition.",
        keywords: 'Digital marketing companies kochi'
    });
})




app.post('/create-payment', (req, res) => {
    const { name, number, email, amount } = req.body;
    console.log('Received form data:', req.body);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `https://www.shashisales.com/payment-sucessful?amount=${amount}&email=${email}&number=${number}`,
            "cancel_url": "https://www.shashisales.com/payment-failed"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": `Payment for ${name}`,
                    "sku": "001",
                    "price": amount,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amount
            },
            "description": `Payment from ${name} (${email})`
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.error('PayPal Error:', error);
            console.error('Error Response:', error.response);
            console.error('HTTP Status Code:', error.httpStatusCode);
            return res.status(500).send('An error occurred with PayPal');
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                    return;
                }
            }
            res.render('error', { message: 'No approval URL found' });
        }
    });
});


// rating system


// POST review
app.post('/submit-review', async (req, res) => {
    try {
        const { rating, question1, question2, question3, question4, email, number } = req.body;

        // email = "suryakantgupta678@gmail.com";
        // number = 8090890890;
        const newReview = new Review({
            rating,
            question1,
            question2,
            question3,
            question4,
            email,
            number
        });

        await newReview.save();
        res.status(200).send({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to submit review', error: error.message });
    }
});






app.all("*", (req, res) => {
    res.render("error");
});



app.listen(4000, () => {
    console.log("listening on port 4000");
})