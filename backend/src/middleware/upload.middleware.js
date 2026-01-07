const multer = require('multer');

// Memory storage for direct S3 upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});

// Video file filter
const videoFileFilter = (req, file, cb) => {
    // Accept videos only
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed (MP4, WebM, MOV, AVI)'), false);
    }
};

// Video upload configuration
const videoUpload = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024, // Default 100MB
    }
});

module.exports = upload;
module.exports.videoUpload = videoUpload;
