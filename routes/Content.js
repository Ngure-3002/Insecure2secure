const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image', 'video', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype.split('/')[0])) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

router.post('/upload', protect, authorize('admin'), upload.single('file'), async (req, res) => {
    try {
        const content = new Content({
            title: req.body.title,
            type: req.body.type,
            description: req.body.description,
            fileUrl: req.file.path,
            uploadedBy: req.user.id
        });
        
        await content.save();
        res.status(201).json({
            success: true,
            content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const content = await Content.find()
            .populate('uploadedBy', 'fullName');
        res.json({
            success: true,
            content
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
