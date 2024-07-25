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
const PaymentDetails = require('./models/PaymentDetails');

const passport = require('./config/passport');

const { google } = require('googleapis');

const paypal = require('paypal-rest-sdk');

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



// Multer setup (only for file uploads)
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
const uploadFields = upload.fields([
    { name: 'blogBannerImage', maxCount: 1 },
    { name: 'images' }
]);

app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next) => {
//     console.log('Request Method:', req.method);
//     console.log('Request URL:', req.url);
//     console.log('Content-Type:', req.headers['content-type']);
//     console.log('Request Body:', req.body);
//     console.log('Request Files:', req.files);
//     next();
//   });
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(cors());
app.use(flash());

dotenv.config();






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
    const authClient = await authenticate();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1sAGLiARDBiDy-1a7PqNaCphH0SjppsTCJ1zC4ktVGyI';
    const range = 'Website Leads!A:E'; // Adjust range as needed
    const valueInputOption = 'RAW';

    let values = [];
    if (data.number) {
        // For /submit-quote-lead route
        const { countryCode, phoneNumber } = parsePhoneNumber(data.number);
        values = [countryCode, phoneNumber, new Date().toISOString()];
    } else if (data.tel) {
        // For /submit-quote route
        const { countryCode, phoneNumber } = parsePhoneNumber(data.tel);
        values = [
            phoneNumber,
            new Date().toISOString(),
            `${data.firstName} ${data.lastName}`,
            data.email,
            data.service,
            countryCode
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

// Helper function to parse the phone number into country code and phone number
function parsePhoneNumber(phoneNumber) {
    const match = phoneNumber.match(/^\+(\d{1,3})\s(\d{4}\s\d{3}\s\d{3}|\d{10})$/);
    if (match) {
        return {
            countryCode: `+${match[1]}`,
            phoneNumber: match[2].replace(/\s/g, '')
        };
    }
    return {
        countryCode: '',
        phoneNumber: phoneNumber.replace(/\s/g, '')
    };
}









app.get("/", async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    const successMessage = req.session.successMessage || null;
    const errorMessage = req.session.errorMessage || null;
    console.log('successMessage:', successMessage); // Log the value of successMessage
    console.log('errorMessage:', errorMessage); // Log the value of errorMessage
    req.session.successMessage = null; // Clear the success message after displaying it
    req.session.errorMessage = null; // Clear the error message after displaying it
    res.render("home", {
        successMessage,
        errorMessage,
        blogs,
        truncateString,
        title: "Leading Website Development & Digital Marketing Services | Shashi Sales",
        description: "Shashi Sales and Marketing provides integrated digital business solutions including website development, advertising, Digital Marketing Services, UI/UX design, graphic and video design, product shoots, branding and PR."
    });
});




app.get("/about-us", (req, res) => {
    res.render("aboutUs", {
        title: 'About us | Digital Marketing Agency | Shashi Sales ',
        description: 'Shashi Sales and Marketing offers expert digital marketing services to enhance online presence, boost engagement, and drive business growth.'
    });
});

/////////////////////////////////////////////////////////////////////////////////////////

app.get("/web-development", (req, res) => {
    res.render("webDevelopment", {
        title: "Leading Website Development Companies - Shashi Sales ",
        description: "Get to know the top website development companies of 2024 and their innovative approaches to web development."
    })
})

///////////////////////////////////////////////////////////////////////////////////////////////

app.get("/contact-us", (req, res) => {
    res.render("contact", {
        title: 'Contact us - Shashi Sales contact information',
        description: 'Reach out to Shashi Sales And Marketing to discuss your Integrated Digital Business Solutions needs. Discover the IT solutions tailored for your business.'
    })
})

////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/fusion-marketing", (req, res) => {
    res.render("advertisement", {
        title: "Affiliate Marketing and off-page seo techniques-Fusion Marketing",
        description: "Shashi Sales and Marketing's fusion funnel approach is a comprehensive marketing strategy that integrates affiliate marketing, and SEO techniques."
    })
})

app.get("/cookie-policy", (req, res) => {
    res.render("cookiePolicy", {
        title: "Cookie Policy - Shashi Sales - Website Developer near me",
        description: "Find your local web development expert now. Get customized, professional website solutions that boost your online presence and growth. Call 1800-571-0605"
    })
})
app.get("/refund-policy", (req, res) => {
    res.render("refundPolicy", {
        title: "Refund Policy - Shashi Sales - Web Designers near me",
        description: "Local web designers can enhance your online presence with custom website designs tailored to your business. Discover experts, Call 1800-571-0605  today!"
    })
})


////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/terms-of-use", (req, res) => {
    res.render("terms", {
        title: "Term of Use - Shashi Sales - Website Development Company",
        description: "Choose the top e-commerce website development company in Delhi for powerful, scalable online stores."
    })
})


///////////////////////////////////////////////////////////////////////////////////////

app.get("/privacy-policy", (req, res) => {
    res.render("privacyPolicy", {
        title: "Privacy Policy - Shashi Sales - website development company",
        description: "Consult with Delhi’s best e-commerce website development experts for customized and effective online solutions."
    })
})

///////////////////////////////////////////////////////////////////////////////////////

app.get("/graphic-design", (req, res) => {
    res.render("design", {
        title: "Top-Rated Web Design Company in Delhi - Shashi Sales ",
        description: "Get Your Online Website In Just 7 Days Rank Your Website Amongst The Top website design Delhi Unlimited Graphic Designing and Video Designing."
    })
})

/////////////////////////////////////////////////////////////////////////////////////

app.get("/email-marketing", (req, res) => {
    res.render("emailMarketing", {
        title: "Email Marketing Services in Delhi - Shashi Sales And Marketing",
        description: "Shashi Sales, Delhi's trusted email marketing company, offers affordable campaigns to boost your brand, sales, and conversions. Call 1800-571-0605 today!"
    })
})

///////////////////////////////////////////////////////////////////////////////////////

app.get("/search-engine-optimization", (req, res) => {
    res.render("seo", {
        title: "Leading SEO Company in Delhi-NCR & Best SEO Agency in Hyderabad | Shashi Sales",
        description: "Shashi Sales And Marketing - Explore the services of the top SEO experts in Delhi-NCR and the best SEO agency in Hyderabad, offering solutions for online success and increased traffic."
    })
});

app.get("/business-services", (req, res) => {
    res.render("businessServices", {
        title: "Digital Marketing Services in Delhi | Shashi Sales And Marketing ",
        description: "Shashi Sales offers digital marketing solutions to businesses across India, U.S. Contact us today to discover how our services can boost your business growth."
    })
});


app.get("/product-shoot", (req, res) => {
    res.render("photography", {
        title: "Product Shoot and Model Shoot Page | Shashi Sales And Marketing",
        description: "Shashi Sales offers Product and Model Shoot to entites across India, U.S. Contact Us today to discover how our services can boost your growth"
    })
});





app.get("/hidden-img", (req, res) => {
    res.render("hidden")
})

app.get("/hidden-img2", (req, res) => {
    res.render("hidden2")
})

function truncateString(str, length = 200) {
    if (str.length > length) {
        return `${str.substring(0, length)}...`;
    }
    return str;
}

app.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        console.log(blogs.canonical);
        res.render("blog", {
            blogs,
            truncateString,
            title: "Draggan AI  Revolutionizing Workflow Optimization - Shashi Sales",
            description: "Discover how Draggan AI is revolutionizing workflow optimization. Explore its powerful capabilities in automating tasks and enhancing efficiency across projects."
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/blog-detail/:canonical", async (req, res) => {
    try {
        const { canonical } = req.params;
        const blog = await Blog.findOne({ canonical: canonical });

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        res.render("blogDetails", { blog });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/blog-form", isAdmin, (req, res) => {
    res.render("uploadForm", {
        title: "Blog Form | Draggan Website: Revolutionizing the Future of AI Technology | Shashi  Sales",
        description: "Visit the Draggan website to learn about groundbreaking AI advancements, tools, and solutions that can transform your business operations and efficiency."
    });
});


// Route for handling blog upload
app.post('/upload-blog', uploadFields, async (req, res) => {
    try {
        const { blogTitle, blogShortDesc, headings, paragraphs, metaTitle, metaDescription, metaKeywords, canonical } = req.body;
        const bannerImage = req.files['blogBannerImage'] ? req.files['blogBannerImage'][0] : null;
        const images = req.files['images'] ? req.files['images'].map(img => `/uploads/${img.filename}`) : [];

        if (!bannerImage) {
            throw new Error('Blog banner image is required');
        }

        const content = [];
        for (let i = 0; i < headings.length; i++) {
            content.push({
                heading: headings[i],
                paragraph: paragraphs[i],
                image: images[i] || null
            });
        }

        const contentText = req.body.contentText.replace(/<\/?[^>]+(>|$)/g, '');


        const blog = new Blog({
            title: blogTitle,
            shortDescription: blogShortDesc,
            bannerImage: `/uploads/${bannerImage.filename}`,
            content,
            metaTitle,
            canonical,
            contentText,
            metaDescription,
            metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()),
        });

        await blog.save();
        console.log(blog);
        // res.status(200).send('Blog uploaded successfully!');
        res.redirect("/all-blogs-list")
    } catch (error) {
        console.error('Error uploading blog:', error);
        res.status(500).send('Failed to upload blog. Please try again.');
    }
});




app.get("/all-blogs-list", isAdmin, async (req, res) => {
    const AllBlogs = await Blog.find();
    // console.log(AllBlogs);
    res.render("allBlogs", {
        AllBlogs,
        title: "All Blog List - how to create a website - Shashi Sales",
        description: "Learn how to create a website with our step-by-step guide for beginners. This comprehensive tutorial covers everything you need to build your site from scratch."
    })
})

app.delete('/delete-blog/:id', async (req, res) => {
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
            blog, title: " ",
            description: " "
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/update-blog/:id', uploadFields, async (req, res) => {
    try {
        const { id } = req.params;
        const { blogTitle, blogShortDesc, headings, paragraphs, metaTitle, metaDescription, metaKeywords, canonical, contentText } = req.body;

        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).send('Blog not found');
        }

        let bannerImagePath = existingBlog.bannerImage;
        if (req.files['blogBannerImage'] && req.files['blogBannerImage'][0]) {
            bannerImagePath = `/uploads/${req.files['blogBannerImage'][0].filename}`;
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
            title: blogTitle,
            shortDescription: blogShortDesc,
            bannerImage: bannerImagePath,
            content,
            metaTitle,
            canonical,
            contentText,
            metaDescription,
            metaKeywords: metaKeywords.split(',').map(keyword => keyword.trim()),
        }, { new: true });

        res.redirect("/all-blogs-list");
    } catch (err) {
        console.error('Error updating blog:', err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
});



//   const recipients = ['suryakantgupta678@gmail.com', 'bgmilelomujhse@gmail.com'];
const recipients = ['anurag.tiwari@shashisales.com', 'info@shashisales.com'];







app.post('/submit-quote', async (req, res) => {
    const formData = req.body;
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

    const referrerUrl = req.get('Referrer') || '/';

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
        description: "Discover the top companies in digital marketing that can help elevate your online presence, drive traffic, and increase your business's success in the digital age."
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
            title: " ",
            description: " "
        });
    });
});





//   payment gateway integration




app.get("/phonepe-form", async (req, res) => {
    res.render("phonepayForm", {
        title: "Digital marketing companies kochi - Shashi Sales And Marketing ",
        description: "Shashi Sales, Access the best digital marketing services tailored for businesses in Kochi to maximize their online potential. Call Call 1800-571-0605 today!"
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
            return res.redirect("/phonepe-form");
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
        return res.redirect("/phonepe-form");
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
        description: "Your payment was successful"
    });
});


app.get("/payment-failed", (req, res) => {
    res.render("paymentfail.ejs", {
        title: " ",
        description: " "
    })
})


app.get("/pay-via-paypal" , (req, res) => {
    res.render("paypalPaymentForm" , {
        title: "Pay via paypal | Shashi Sales And Marketing",
        description: "Shashi Sales and Marketing offers innovative solutions to transform your business, boost customer loyalty, and stay ahead of the competition."
    } );
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
        const { rating, question1, question2, question3, question4, email, number} = req.body;

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