const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { videoUpload } = require('../middleware/upload.middleware');

// All upload routes require authentication
router.use(authMiddleware);

// Single image upload
router.post('/single', upload.single('image'), uploadController.uploadSingle);

// Multiple images upload
router.post('/multiple', upload.array('images', 10), uploadController.uploadMultiple);

// Delete image
router.delete('/', uploadController.deleteImage);

// Single video upload
router.post('/video', videoUpload.single('video'), uploadController.uploadVideo);

// Delete video
router.delete('/video', uploadController.deleteVideo);

module.exports = router;
