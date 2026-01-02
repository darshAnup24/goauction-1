import apiClient from './api.service';
import API_CONFIG from '../config/api.config';

const uploadService = {
  // Upload image to S3 via backend
  async uploadImage(file, folder = 'listings') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await apiClient.post(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Upload multiple images
  async uploadMultipleImages(files, folder = 'listings') {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  },

  // Delete image from S3
  async deleteImage(imageUrl) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_IMAGE, { 
      data: { url: imageUrl } 
    });
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(file) {
    return await this.uploadImage(file, 'avatars');
  },

  // Validate image file
  validateImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  }
};

export default uploadService;
