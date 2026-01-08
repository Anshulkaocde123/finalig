// Image Optimization Utilities
// Helper functions for lazy loading and image optimization

// Lazy load images using Intersection Observer
export const lazyLoadImage = (imageRef, callback) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    if (imageRef.current && imageRef.current.dataset.src) {
      imageRef.current.src = imageRef.current.dataset.src;
    }
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            if (callback) callback();
          }
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before image is visible
      threshold: 0.01
    }
  );

  if (imageRef.current) {
    observer.observe(imageRef.current);
  }

  return () => {
    if (imageRef.current) {
      observer.unobserve(imageRef.current);
    }
    observer.disconnect();
  };
};

// Get optimized image URL (for future CDN integration)
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';

  const {
    width = 800,
    quality = 80,
    format = 'auto'
  } = options;

  // For now, return original URL
  // In future, integrate with image CDN:
  // return `https://your-cdn.com/resize?url=${encodeURIComponent(url)}&w=${width}&q=${quality}&f=${format}`;
  
  return url;
};

// Preload critical images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = (urls) => {
  return Promise.all(urls.map(preloadImage));
};

// Check if image is in viewport
export const isImageInViewport = (element) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Get image dimensions without loading full image
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    img.onerror = reject;
    img.src = url;
  });
};

export default {
  lazyLoadImage,
  getOptimizedImageUrl,
  preloadImage,
  preloadImages,
  isImageInViewport,
  getImageDimensions,
};
