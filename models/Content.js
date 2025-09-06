const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    type: {
        type: String,
        required: true,
        enum: ['video', 'pdf', 'audio', 'article']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    size: {
        type: Number,
        required: [true, 'File size is required'],
        max: [52428800, 'File size cannot exceed 50MB'] // 50MB in bytes
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Add index for better search performance
contentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Content', contentSchema);
