/**
 * Code Splitting Utilities
 * Dynamic imports and route-based code splitting
 */

import React, { lazy, Suspense } from 'react';

// ============================================
// LAZY LOAD ROUTE COMPONENT
// ============================================
export const lazyLoadRoute = (importFunc, options = {}) => {
  const { 
    fallback = null,
    delay = 200,
    retries = 3 
  } = options;

  const Component = lazy(() => 
    retry(importFunc, retries, delay)
  );

  return (props) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// ============================================
// RETRY MECHANISM FOR DYNAMIC IMPORTS
// Handles network failures during chunk loading
// ============================================
const retry = (importFunc, retries = 3, interval = 200) => {
  return new Promise((resolve, reject) => {
    importFunc()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retries === 1) {
            reject(error);
            return;
          }
          retry(importFunc, retries - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// ============================================
// LOADING FALLBACK COMPONENT
// ============================================
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// ============================================
// PRELOAD COMPONENT
// Preload a component before it's needed
// ============================================
export const preloadComponent = (importFunc) => {
  const Component = lazy(importFunc);
  
  // Trigger preload
  Component._preload = importFunc;
  
  return Component;
};

// ============================================
// LAZY LOAD WITH DATA
// Lazy load component with data fetching
// ============================================
export const lazyLoadWithData = (importFunc, dataLoader) => {
  const Component = lazy(async () => {
    const [componentModule, data] = await Promise.all([
      importFunc(),
      dataLoader()
    ]);

    return {
      default: (props) => <componentModule.default {...props} initialData={data} />
    };
  });

  return (props) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// ============================================
// ROUTE CONFIG WITH CODE SPLITTING
// ============================================
export const createRouteConfig = (routes) => {
  return routes.map((route) => ({
    ...route,
    component: route.lazy 
      ? lazyLoadRoute(route.component, route.loadingOptions)
      : route.component
  }));
};

// ============================================
// CHUNK LOADING ERROR BOUNDARY
// ============================================
export class ChunkLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    if (error.name === 'ChunkLoadError') {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error.name === 'ChunkLoadError') {
      console.error('Chunk loading failed:', error, errorInfo);
      
      // Optionally reload the page
      if (this.props.reloadOnError) {
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Loading Error</h2>
            <p className="mb-4">Failed to load the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// ============================================
// DYNAMIC MODULE LOADER
// Load modules on demand
// ============================================
export class ModuleLoader {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  async load(moduleName, importFunc) {
    // Return cached module
    if (this.cache.has(moduleName)) {
      return this.cache.get(moduleName);
    }

    // Return pending promise
    if (this.pending.has(moduleName)) {
      return this.pending.get(moduleName);
    }

    // Start loading
    const promise = importFunc()
      .then((module) => {
        this.cache.set(moduleName, module);
        this.pending.delete(moduleName);
        return module;
      })
      .catch((error) => {
        this.pending.delete(moduleName);
        throw error;
      });

    this.pending.set(moduleName, promise);
    return promise;
  }

  preload(moduleName, importFunc) {
    if (!this.cache.has(moduleName) && !this.pending.has(moduleName)) {
      this.load(moduleName, importFunc);
    }
  }

  clear(moduleName) {
    if (moduleName) {
      this.cache.delete(moduleName);
      this.pending.delete(moduleName);
    } else {
      this.cache.clear();
      this.pending.clear();
    }
  }
}

// Global module loader instance
export const moduleLoader = new ModuleLoader();

// ============================================
// PREFETCH ON HOVER
// Prefetch route when user hovers over link
// ============================================
export const usePrefetch = (importFunc) => {
  const prefetchTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    prefetchTimeoutRef.current = setTimeout(() => {
      importFunc();
    }, 100);
  };

  const handleMouseLeave = () => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }
  };

  React.useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  };
};

// ============================================
// PROGRESSIVE LOADING
// Load features progressively based on priority
// ============================================
export class ProgressiveLoader {
  constructor() {
    this.queue = [];
    this.loaded = new Set();
    this.loading = false;
  }

  register(name, importFunc, priority = 0) {
    this.queue.push({ name, importFunc, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  async loadNext() {
    if (this.loading || this.queue.length === 0) return;

    this.loading = true;
    const { name, importFunc } = this.queue.shift();

    try {
      await importFunc();
      this.loaded.add(name);
    } catch (error) {
      console.error(`Failed to load ${name}:`, error);
    } finally {
      this.loading = false;
      
      // Continue loading
      if (this.queue.length > 0) {
        requestIdleCallback(() => this.loadNext());
      }
    }
  }

  startLoading() {
    requestIdleCallback(() => this.loadNext());
  }

  isLoaded(name) {
    return this.loaded.has(name);
  }
}

// ============================================
// VISIBILITY-BASED LOADING
// Load component when it becomes visible
// ============================================
export const lazyLoadOnVisible = (importFunc, options = {}) => {
  return (props) => {
    const [shouldLoad, setShouldLoad] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        {
          threshold: options.threshold || 0.01,
          rootMargin: options.rootMargin || '50px'
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    if (!shouldLoad) {
      return <div ref={ref} style={{ minHeight: options.minHeight || '100px' }} />;
    }

    const Component = lazy(importFunc);

    return (
      <Suspense fallback={options.fallback || <LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
};
