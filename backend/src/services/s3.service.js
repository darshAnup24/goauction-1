const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.bucketName = process.env.S3_BUCKET_NAME;
        this.bucketUrl = process.env.S3_BUCKET_URL;
    }

    /**
     * Upload image to S3
     * @param {Object} file - Multer file object
     * @param {String} folder - Folder name in S3 bucket
     * @returns {Promise<Object>} - {url, key}
     */
    async uploadImage(file, folder = 'listings') {
        const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // Removed ACL - use bucket policy for public access instead
        });

        try {
            await this.s3Client.send(command);

            const s3Url = `${this.bucketUrl}/${key}`;

            // If CloudFront is configured, return CloudFront URL
            const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
            const deliveryUrl = cloudFrontDomain
                ? `${cloudFrontDomain}/${key}`
                : s3Url;

            return {
                url: deliveryUrl,  // CloudFront URL for delivery
                key: key,
                s3Url: s3Url      // Original S3 URL for reference
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.$metadata?.httpStatusCode
            });
            throw new Error(`Failed to upload image to S3: ${error.message}`);
        }
    }

    /**
     * Upload multiple images
     * @param {Array} files - Array of multer file objects
     * @param {String} folder - Folder name in S3 bucket
     * @returns {Promise<Array>} - Array of {url, key} objects
     */
    async uploadMultipleImages(files, folder = 'listings') {
        const uploadPromises = files.map(file => this.uploadImage(file, folder));
        return await Promise.all(uploadPromises);
    }

    /**
     * Delete image from S3
     * @param {String} key - S3 object key
     * @returns {Promise<void>}
     */
    async deleteImage(key) {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            console.error('S3 delete error:', error);
            throw new Error('Failed to delete image from S3');
        }
    }

    /**
     * Delete multiple images
     * @param {Array} keys - Array of S3 object keys
     * @returns {Promise<void>}
     */
    async deleteMultipleImages(keys) {
        const deletePromises = keys.map(key => this.deleteImage(key));
        await Promise.all(deletePromises);
    }

    /**
     * Get signed URL for private objects
     * @param {String} key - S3 object key
     * @param {Number} expiresIn - URL expiration time in seconds
     * @returns {Promise<String>} - Signed URL
     */
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        try {
            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error('S3 signed URL error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }

    /**
     * Upload video to S3
     * @param {Object} file - Multer file object
     * @param {String} folder - Folder name in S3 bucket
     * @returns {Promise<Object>} - {url, key, cloudFrontUrl}
     */
    async uploadVideo(file, folder = 'videos') {
        const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        try {
            await this.s3Client.send(command);

            const s3Url = `${this.bucketUrl}/${key}`;

            // If CloudFront is configured, return CloudFront URL
            const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
            const deliveryUrl = cloudFrontDomain
                ? `${cloudFrontDomain}/${key}`
                : s3Url;

            return {
                url: deliveryUrl,  // CloudFront URL for delivery
                key: key,
                s3Url: s3Url      // Original S3 URL for reference
            };
        } catch (error) {
            console.error('S3 video upload error:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.$metadata?.httpStatusCode
            });
            throw new Error(`Failed to upload video to S3: ${error.message}`);
        }
    }

    /**
     * Upload multiple videos
     * @param {Array} files - Array of multer file objects
     * @param {String} folder - Folder name in S3 bucket
     * @returns {Promise<Array>} - Array of {url, key, cloudFrontUrl} objects
     */
    async uploadMultipleVideos(files, folder = 'videos') {
        const uploadPromises = files.map(file => this.uploadVideo(file, folder));
        return await Promise.all(uploadPromises);
    }

    /**
     * Delete video from S3
     * @param {String} urlOrKey - S3 URL or object key
     * @returns {Promise<void>}
     */
    async deleteVideo(urlOrKey) {
        // Extract key from URL if URL is provided
        const key = urlOrKey.includes('http')
            ? this.extractKeyFromUrl(urlOrKey)
            : urlOrKey;

        if (!key) {
            throw new Error('Invalid video URL or key');
        }

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        try {
            await this.s3Client.send(command);
        } catch (error) {
            console.error('S3 video delete error:', error);
            throw new Error('Failed to delete video from S3');
        }
    }

    /**
     * Extract S3 key from URL (works with both S3 and CloudFront URLs)
     * @param {String} url - Full S3 or CloudFront URL
     * @returns {String} - S3 key
     */
    extractKeyFromUrl(url) {
        if (!url) return null;

        // Handle CloudFront URLs
        const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
        if (cloudFrontDomain && url.includes(cloudFrontDomain)) {
            const urlParts = url.split(cloudFrontDomain + '/');
            return urlParts.length > 1 ? urlParts[1] : null;
        }

        // Handle bucket URL formats
        const urlParts = url.split(this.bucketUrl + '/');
        if (urlParts.length > 1) {
            return urlParts[1];
        }

        // Fallback for other S3 URL formats
        const match = url.match(/\.s3\..*\.amazonaws\.com\/(.+)/);
        return match ? match[1] : null;
    }
}

module.exports = new S3Service();
