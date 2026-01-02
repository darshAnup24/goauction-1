const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All upload routes require authentication
router.use(authMiddleware);

// Single image upload
router.post('/single', upload.single('image'), uploadController.uploadSingle);

// Multiple images upload
router.post('/multiple', upload.array('images', 10), uploadController.uploadMultiple);

// Delete image
router.delete('/', uploadController.deleteImage);

module.exports = router;
