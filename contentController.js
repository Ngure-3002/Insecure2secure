const Content = require('../models/Content');
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Configure upload
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video', 'audio', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype.split('/')[0])) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
}).single('file');

// Upload content
const uploadContent = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const content = await Content.create({
                title: req.body.title,
                type: req.body.type,
                description: req.body.description,
                fileUrl: req.file.path,
                size: req.file.size,
                uploadedBy: req.user._id
            });

            res.status(201).json({
                success: true,
                data: content
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    });
};

// Get all content
const getAllContent = async (req, res) => {
    try {
        const content = await Content.find({ status: 'active' })
            .populate('uploadedBy', 'fullName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete content
const deleteContent = async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Soft delete
        content.status = 'inactive';
        await content.save();

        res.json({
            success: true,
            message: 'Content deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    uploadContent,
    getAllContent,
    deleteContent
};
