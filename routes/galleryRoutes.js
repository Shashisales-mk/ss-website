const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const Blog = require('../models/Blog');
// const sharp = require('sharp');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/gallery', async (req, res) => {
    try {
        const galleryItems = await Gallery.find();
        res.render('gallery', {
            galleryItems,
            title: "Gallery | Shashi Sales And Marketing",
            description: "Gallery Shoot to entities across India, U.S. Contact Us today to discover how our services can boost your growth"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
// router.get('/all-blogs-list', async (req, res) => {
//     try {
//         const galleryItems = await Gallery.find();
//         const category = await Gallery.find();
//         const AllBlogs = await Blog.find();

//         res.render("allBlogs", { 
//             AllBlogs,
//             galleryItems,
//             category,
//             title: "All Blog List - how to create a website - Shashi Sales",
//             description: "Learn how to create a website with our step-by-step guide for beginners. This comprehensive tutorial covers everything you need to build your site from scratch."
//          })
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

router.get('/add', (req, res) => {
    res.render('addGallery', {
        title: 'Add Gallery | Shashi Sales And Marketing',
        description: 'Upload images or videos for the gallery.'
    });
});
// Add gallery item
router.post('/add', upload.single('file'), async (req, res) => {
    const { type, category, tags, section } = req.body;

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    try {
        if (!req.file || !req.file.path) {
            throw new Error('File upload failed.');
        }

        let aspectRatio = null;

        // if (type === 'image') {
        //     const image = sharp(req.file.path);
        //     const metadata = await image.metadata();
            
        //     if (!metadata.format) {
        //         throw new Error('Unsupported image format.');
        //     }

        //     aspectRatio = metadata.width / metadata.height;
        // } else if (type === 'video') {
        //     aspectRatio = null;
        // } else {
        //     throw new Error('Unsupported file type.');
        // }

        const newGalleryItem = new Gallery({
            type,
            src: filePath,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            section,
            // aspectRatio
        });

        await newGalleryItem.save();
        res.redirect('/all-blogs-list');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ error: error.message });
    }
});
// Delete a gallery item
router.post('/delete/:id', async (req, res) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id);
        if (!galleryItem) {
            return res.status(404).send('Gallery item not found');
        }

        const filePath = path.join(__dirname, '..', 'public', galleryItem.src);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            }
        });

        await Gallery.findByIdAndDelete(req.params.id);
        res.redirect('/all-blogs-list');
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;