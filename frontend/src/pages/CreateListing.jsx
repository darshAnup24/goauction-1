import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, X, Plus, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import listingsService from '../services/listings.service';
import uploadService from '../services/upload.service';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Collectibles',
  'Art',
  'Jewelry',
  'Automotive',
  'Musical Instruments',
  'Furniture',
  'Other'
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Get current time rounded to next hour
  const getDefaultStartTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 25); // 24 hours from next hour
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    reservePrice: '',
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return '';
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end - start;
    if (diffMs <= 0) return 'Invalid duration';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const data = await uploadService.uploadImage(file);
        uploadedUrls.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    if (!formData.startingPrice || formData.startingPrice <= 0) {
      toast.error('Valid starting price is required');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    // Validate dates
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    const now = new Date();

    if (startTime < now) {
      toast.error('Start time must be in the future');
      return;
    }

    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    if (durationHours < 1) {
      toast.error('Auction duration must be at least 1 hour');
      return;
    }

    if (durationHours > 720) { // 30 days
      toast.error('Auction duration cannot exceed 30 days');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        images: formData.images
      };

      const data = await listingsService.createListing(listingData);

      if (data.success) {
        toast.success('Listing created successfully!');
        navigate('/dashboard/listings');
      } else {
        throw new Error(data.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Create listing error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-600 mt-2">List your item for auction</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Vintage Rolex Watch"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              placeholder="Describe your item in detail..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Starting Price *
              </label>
              <input
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reserve Price (Optional)
              </label>
              <input
                type="number"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Auction Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {new Date(formData.startTime).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                min={formData.startTime}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {new Date(formData.endTime).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Duration Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Auction Duration:</span>
              <span className="font-bold">{calculateDuration()}</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Your auction will run from {new Date(formData.startTime).toLocaleString()} 
              {' '}to {new Date(formData.endTime).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              Images * (Max 5)
            </label>

            {/* Image Upload Button */}
            {formData.images.length < 5 && (
              <div className="mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  <Plus className="w-5 h-5" />
                  {uploadingImages ? 'Uploading...' : 'Add Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/listings')}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
