/**
 * Backend Performance Utilities
 */

// ============================================
// DEBOUNCE FOR NODE.JS
// ============================================
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function debounced(...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// ============================================
// THROTTLE FOR NODE.JS
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
// MEMOIZATION
// ============================================
export const memoize = (fn, options = {}) => {
  const cache = new Map();
  const maxSize = options.maxSize || 100;
  const ttl = options.ttl || null;
  
  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      const cached = cache.get(key);
      
      if (ttl) {
        if (Date.now() - cached.timestamp < ttl) {
          return cached.value;
        }
        cache.delete(key);
      } else {
        return cached.value;
      }
    }
    
    const result = fn.apply(this, args);
    
    // Manage cache size
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    return result;
  };
};

// ============================================
// BATCH PROCESSING
// ============================================
export class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 100;
    this.delay = options.delay || 100;
    this.processor = options.processor;
    this.queue = [];
    this.processing = false;
  }
  
  add(item) {
    this.queue.push(item);
    this.scheduleProcess();
  }
  
  addBatch(items) {
    this.queue.push(...items);
    this.scheduleProcess();
  }
  
  scheduleProcess() {
    if (this.processing) return;
    
    setTimeout(() => this.process(), this.delay);
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      try {
        await this.processor(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
    }
    
    this.processing = false;
  }
}

// ============================================
// DEEP CLONE
// ============================================
export const deepClone = (obj, hash = new WeakMap()) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  if (Array.isArray(obj)) {
    const arrCopy = [];
    hash.set(obj, arrCopy);
    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, hash);
    });
    return arrCopy;
  }
  
  const objCopy = Object.create(Object.getPrototypeOf(obj));
  hash.set(obj, objCopy);
  
  Object.keys(obj).forEach(key => {
    objCopy[key] = deepClone(obj[key], hash);
  });
  
  return objCopy;
};

// ============================================
// ASYNC QUEUE
// ============================================
export class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
  
  size() {
    return this.queue.length;
  }
  
  clear() {
    this.queue = [];
  }
}

// ============================================
// RETRY MECHANISM
// ============================================
export const retry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = () => true
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

// ============================================
// CIRCUIT BREAKER
// ============================================
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt
    };
  }
}

// ============================================
// CUSTOM MAP FUNCTION
// ============================================
export const customMap = (array, callback, thisArg) => {
  if (!Array.isArray(array)) {
    throw new TypeError('First argument must be an array');
  }
  
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  
  const result = [];
  const length = array.length;
  
  for (let i = 0; i < length; i++) {
    if (i in array) {
      result[i] = callback.call(thisArg, array[i], i, array);
    }
  }
  
  return result;
};
