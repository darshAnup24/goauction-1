import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from 'lucide-react';

export default function ImageGallery({ images, videos }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Parse arrays if they're strings
  const imageArray = typeof images === 'string' ? JSON.parse(images) : images || [];
  const videoArray = typeof videos === 'string' ? JSON.parse(videos) : videos || [];

  // Combine images and videos into a single media array
  const mediaItems = [
    ...imageArray.map(url => ({ type: 'image', url })),
    ...videoArray.map(url => ({ type: 'video', url }))
  ];

  if (mediaItems.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center h-96">
        <p className="text-gray-500">No media available</p>
      </div>
    );
  }

  const currentMedia = mediaItems[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Media Display */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={`Product ${selectedIndex + 1}`}
              className="w-full h-96 object-contain cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            />
          ) : (
            <video
              src={currentMedia.url}
              controls
              className="w-full h-96 object-contain bg-black"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Zoom Icon (only for images) */}
          {currentMedia.type === 'image' && (
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          )}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Media Counter with Type Badge */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {currentMedia.type === 'video' && (
              <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Play className="w-3 h-3" />
                Video
              </div>
            )}
            <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {mediaItems.length}
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {mediaItems.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {mediaItems.map((media, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`
                  relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${selectedIndex === index
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-400'
                  }
                `}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal (only for images) */}
      {showLightbox && currentMedia.type === 'image' && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 p-2 rounded-lg transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <img
            src={currentMedia.url}
            alt={`Full size ${selectedIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-lg">
            {selectedIndex + 1} / {mediaItems.length}
          </div>
        </div>
      )}
    </>
  );
}
