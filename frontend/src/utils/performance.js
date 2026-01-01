/**
 * Performance Utilities
 * Production-ready performance optimization utilities
 */

// ============================================
// DEBOUNCING
// Delays execution until after a quiet period
// ============================================
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function debounced(...args) {
    const context = this;
    
    // Clear previous timer
    clearTimeout(timeoutId);
    
    // Set new timer
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// ============================================
// THROTTLING
// Limits execution frequency
// ============================================
export const throttle = (func, limit = 300) => {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function throttled(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, Math.max(limit - (Date.now() - lastRan), 0));
    }
  };
};

// ============================================
// DEEP CLONE
// Creates a deep copy of objects/arrays
// ============================================
export const deepClone = (obj, hash = new WeakMap()) => {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle circular references
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);
    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, hash);
    });
    return arrCopy;
  }
  
  // Handle Map
  if (obj instanceof Map) {
    const mapCopy = new Map();
    hash.set(obj, mapCopy);
    obj.forEach((value, key) => {
      mapCopy.set(key, deepClone(value, hash));
    });
    return mapCopy;
  }
  
  // Handle Set
  if (obj instanceof Set) {
    const setCopy = new Set();
    hash.set(obj, setCopy);
    obj.forEach((value) => {
      setCopy.add(deepClone(value, hash));
    });
    return setCopy;
  }
  
  // Handle Object
  const objCopy = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, objCopy);
  
  Object.keys(obj).forEach(key => {
    objCopy[key] = deepClone(obj[key], hash);
  });
  
  return objCopy;
};

// ============================================
// SHALLOW COPY
// Creates a shallow copy (first level only)
// ============================================
export const shallowCopy = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return [...obj];
  }
  
  return { ...obj };
};

// ============================================
// CUSTOM MAP FUNCTION
// Demonstrates understanding of array methods
// ============================================
export const customMap = function(array, callback, thisArg) {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  
  const result = [];
  const length = array.length;
  
  for (let i = 0; i < length; i++) {
    if (i in array) { // Check if index exists (sparse arrays)
      result[i] = callback.call(thisArg, array[i], i, array);
    }
  }
  
  return result;
};

// ============================================
// MEMOIZATION
// Cache expensive function results
// ============================================
export const memoize = (fn) => {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
};

// ============================================
// LAZY FUNCTION
// Defers initialization until first use
// ============================================
export const lazy = (initializer) => {
  let initialized = false;
  let value;
  
  return () => {
    if (!initialized) {
      value = initializer();
      initialized = true;
    }
    return value;
  };
};

// ============================================
// RAF THROTTLE
// Throttle using requestAnimationFrame
// ============================================
export const rafThrottle = (callback) => {
  let requestId = null;
  let lastArgs;
  
  const later = (context) => () => {
    requestId = null;
    callback.apply(context, lastArgs);
  };
  
  const throttled = function(...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later(this));
    }
  };
  
  throttled.cancel = () => {
    cancelAnimationFrame(requestId);
    requestId = null;
  };
  
  return throttled;
};

// ============================================
// BATCH UPDATES
// Group multiple DOM updates into one
// ============================================
export const batchUpdates = (updates) => {
  const fragment = document.createDocumentFragment();
  
  updates.forEach(update => {
    if (typeof update === 'function') {
      update(fragment);
    }
  });
  
  return fragment;
};

// ============================================
// IDLE CALLBACK WRAPPER
// Execute non-critical work during idle time
// ============================================
export const scheduleIdleTask = (task, options = {}) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(task, options);
  }
  
  // Fallback for browsers without requestIdleCallback
  return setTimeout(() => {
    task({
      didTimeout: false,
      timeRemaining: () => 50
    });
  }, 1);
};

// ============================================
// CANCEL IDLE CALLBACK
// ============================================
export const cancelIdleTask = (handle) => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
};
