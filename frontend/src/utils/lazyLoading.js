/**
 * Lazy Loading Utilities
 * Image lazy loading with Intersection Observer
 */

import { useEffect, useRef, useState } from 'react';
import { ResourceManager } from './memoryManagement';

// ============================================
// LAZY IMAGE COMPONENT
// Uses Intersection Observer for optimal performance
// ============================================
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  onLoad,
  threshold = 0.01,
  rootMargin = '50px'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const resourceManager = useRef(new ResourceManager());

  useEffect(() => {
    if (!imgRef.current) return;

    const { observer } = resourceManager.current.addIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(imgRef.current);

    return () => {
      resourceManager.current.cleanup();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, onLoad]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      loading="lazy"
    />
  );
};

// ============================================
// USE LAZY LOAD HOOK
// Reusable hook for lazy loading any element
// ============================================
export const useLazyLoad = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);
  const resourceManager = useRef(new ResourceManager());

  const {
    threshold = 0.01,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    if (!elementRef.current || (triggerOnce && hasLoaded)) return;

    const { observer } = resourceManager.current.addIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            
            if (triggerOnce) {
              setHasLoaded(true);
              observer.disconnect();
            }
          } else {
            if (!triggerOnce) {
              setIsInView(false);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(elementRef.current);

    return () => {
      resourceManager.current.cleanup();
    };
  }, [threshold, rootMargin, triggerOnce, hasLoaded]);

  return { elementRef, isInView, hasLoaded };
};

// ============================================
// LAZY LOAD WRAPPER COMPONENT
// ============================================
export const LazyLoad = ({ 
  children, 
  placeholder = null,
  height = 'auto',
  className = '',
  ...options 
}) => {
  const { elementRef, isInView } = useLazyLoad(options);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ minHeight: height }}
    >
      {isInView ? children : placeholder}
    </div>
  );
};

// ============================================
// PROGRESSIVE IMAGE LOADER
// Loads low quality first, then high quality
// ============================================
export const ProgressiveImage = ({ 
  lowQualitySrc, 
  highQualitySrc, 
  alt,
  className = ''
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);
  const { elementRef, isInView } = useLazyLoad();

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = highQualitySrc;

    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };

    return () => {
      img.onload = null;
    };
  }, [isInView, highQualitySrc]);

  return (
    <div ref={elementRef}>
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isHighQualityLoaded ? 'hq-loaded' : 'lq-loaded'}`}
        style={{
          filter: isHighQualityLoaded ? 'none' : 'blur(5px)',
          transition: 'filter 0.3s ease'
        }}
      />
    </div>
  );
};

// ============================================
// BACKGROUND IMAGE LAZY LOADER
// ============================================
export const LazyBackground = ({ 
  src, 
  children, 
  className = '',
  style = {},
  ...options 
}) => {
  const [backgroundImage, setBackgroundImage] = useState('none');
  const { elementRef, isInView } = useLazyLoad(options);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setBackgroundImage(`url(${src})`);
    };

    return () => {
      img.onload = null;
    };
  }, [isInView, src]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        backgroundImage
      }}
    >
      {children}
    </div>
  );
};

// ============================================
// INFINITE SCROLL HOOK
// ============================================
export const useInfiniteScroll = (callback, options = {}) => {
  const [isFetching, setIsFetching] = useState(false);
  const loaderRef = useRef(null);
  const resourceManager = useRef(new ResourceManager());

  const {
    threshold = 0.1,
    rootMargin = '100px'
  } = options;

  useEffect(() => {
    if (!loaderRef.current) return;

    const { observer } = resourceManager.current.addIntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !isFetching) {
            setIsFetching(true);
            await callback();
            setIsFetching(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(loaderRef.current);

    return () => {
      resourceManager.current.cleanup();
    };
  }, [callback, threshold, rootMargin, isFetching]);

  return { loaderRef, isFetching };
};

// ============================================
// IMAGE PRELOADER
// Preload images in the background
// ============================================
export const preloadImages = (urls, onProgress) => {
  let loaded = 0;
  const total = urls.length;

  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            loaded++;
            onProgress?.(loaded, total);
            resolve(url);
          };
          
          img.onerror = () => {
            loaded++;
            onProgress?.(loaded, total);
            reject(new Error(`Failed to load: ${url}`));
          };
          
          img.src = url;
        })
    )
  );
};

// ============================================
// RESPONSIVE IMAGE LOADER
// Loads appropriate image based on viewport
// ============================================
export const ResponsiveImage = ({ 
  sources, 
  alt, 
  className = '' 
}) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const { elementRef, isInView } = useLazyLoad();

  useEffect(() => {
    if (!isInView) return;

    const updateImage = () => {
      const width = window.innerWidth;
      let selectedSrc = sources.default;

      // Find the appropriate source based on viewport width
      if (width < 640 && sources.mobile) {
        selectedSrc = sources.mobile;
      } else if (width < 1024 && sources.tablet) {
        selectedSrc = sources.tablet;
      } else if (sources.desktop) {
        selectedSrc = sources.desktop;
      }

      setCurrentSrc(selectedSrc);
    };

    updateImage();
    window.addEventListener('resize', updateImage);

    return () => {
      window.removeEventListener('resize', updateImage);
    };
  }, [isInView, sources]);

  return (
    <div ref={elementRef}>
      {currentSrc && (
        <img src={currentSrc} alt={alt} className={className} />
      )}
    </div>
  );
};
