const s3Service = require('../services/s3.service');

class UploadController {
    // Upload single image
    async uploadSingle(req, res, next) {
        try {
            console.log('📤 Upload request received');
            console.log('User:', req.user?.id);
            console.log('File:', req.file ? req.file.originalname : 'No file');
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            console.log('📦 Uploading to S3...');
            const result = await s3Service.uploadImage(req.file);
            console.log('✅ Upload successful:', result.url);

            res.json({
                success: true,
                message: 'Image uploaded successfully',
                url: result.url,
                key: result.key
            });
        } catch (error) {
            console.error('❌ Upload controller error:', error.message);
            next(error);
        }
    }

    // Upload multiple images
    async uploadMultiple(req, res, next) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            const results = await s3Service.uploadMultipleImages(req.files);

            res.json({
                success: true,
                message: 'Images uploaded successfully',
                urls: results.map(r => r.url),
                results: results
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete image
    async deleteImage(req, res, next) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'Image URL is required'
                });
            }

            await s3Service.deleteImage(url);

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UploadController();
