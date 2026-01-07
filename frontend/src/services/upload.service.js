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
  },

  // Upload video to S3 via backend
  async uploadVideo(file, onProgress) {
    const formData = new FormData();
    formData.append('video', file);

    const response = await apiClient.post(API_CONFIG.ENDPOINTS.UPLOAD_VIDEO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  // Delete video from S3
  async deleteVideo(videoUrl) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_VIDEO, {
      data: { url: videoUrl }
    });
    return response.data;
  },

  // Validate video file
  validateVideo(file) {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload MP4, WebM, MOV, or AVI videos.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 100MB.');
    }

    return true;
  }
};

export default uploadService;
