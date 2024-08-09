const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const Blog = require('../models/Blog');

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

// GET /gallery - Display gallery items
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

// GET /add - Render add gallery page
router.get('/add', (req, res) => {
    res.render('addGallery', {
        title: 'Add Gallery | Shashi Sales And Marketing',
        description: 'Upload images or videos for the gallery.'
    });
});

// POST /add - Add gallery items
router.post('/add', upload.array('files', 12), async (req, res) => {
    const { category, tags } = req.body;

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one file must be uploaded.' });
    }

    const sections = ['section1', 'section2', 'section3'];
    let currentSectionIndex = 0;

    try {
        const galleryItems = req.files.map((file, index) => {
            const filePath = `/uploads/${file.filename}`;
            const section = sections[currentSectionIndex];
            currentSectionIndex = (currentSectionIndex + 1) % sections.length;

            return {
                type: file.mimetype.startsWith('image') ? 'image' : 'video',
                src: filePath,
                category,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                section
            };
        });

        await Gallery.insertMany(galleryItems);
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


router.post('/delete-multiple', async (req, res) => {
    try {
        const selectedItems = req.body.selectedItems || [];
        
        if (selectedItems.length === 0) {
            return res.status(400).send('No items selected for deletion');
        }

        const itemsToDelete = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

        for (const itemId of itemstoDelete) {
            const galleryItem = await Gallery.findById(itemId);
            if (galleryItem) {
                const filePath = path.join(__dirname, '..', 'public', galleryItem.src);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                await Gallery.findByIdAndDelete(itemId);
            }
        }

        res.redirect('/all-blogs-list');
    } catch (error) {
        console.error('Error deleting multiple gallery items:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
