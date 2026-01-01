/**
 * Memory Leak Prevention Utilities
 * Proper cleanup of timers, event listeners, and other resources
 */

// ============================================
// EVENT LISTENER MANAGER
// Automatically tracks and cleans up event listeners
// ============================================
export class EventListenerManager {
  constructor() {
    this.listeners = new Map();
  }
  
  add(target, event, handler, options) {
    if (!target || !event || !handler) {
      console.warn('Invalid event listener parameters');
      return null;
    }
    
    const key = Symbol('listener');
    
    target.addEventListener(event, handler, options);
    
    this.listeners.set(key, {
      target,
      event,
      handler,
      options
    });
    
    return key;
  }
  
  remove(key) {
    const listener = this.listeners.get(key);
    
    if (listener) {
      listener.target.removeEventListener(
        listener.event,
        listener.handler,
        listener.options
      );
      this.listeners.delete(key);
      return true;
    }
    
    return false;
  }
  
  removeAll() {
    this.listeners.forEach((listener) => {
      listener.target.removeEventListener(
        listener.event,
        listener.handler,
        listener.options
      );
    });
    
    this.listeners.clear();
  }
  
  size() {
    return this.listeners.size;
  }
}

// ============================================
// TIMER MANAGER
// Automatically tracks and cleans up timers
// ============================================
export class TimerManager {
  constructor() {
    this.timers = new Map();
  }
  
  setTimeout(callback, delay, ...args) {
    const id = setTimeout(() => {
      callback(...args);
      this.timers.delete(key);
    }, delay);
    
    const key = Symbol('timeout');
    this.timers.set(key, { id, type: 'timeout' });
    
    return key;
  }
  
  setInterval(callback, delay, ...args) {
    const id = setInterval(() => callback(...args), delay);
    
    const key = Symbol('interval');
    this.timers.set(key, { id, type: 'interval' });
    
    return key;
  }
  
  clear(key) {
    const timer = this.timers.get(key);
    
    if (timer) {
      if (timer.type === 'timeout') {
        clearTimeout(timer.id);
      } else if (timer.type === 'interval') {
        clearInterval(timer.id);
      }
      
      this.timers.delete(key);
      return true;
    }
    
    return false;
  }
  
  clearAll() {
    this.timers.forEach((timer) => {
      if (timer.type === 'timeout') {
        clearTimeout(timer.id);
      } else if (timer.type === 'interval') {
        clearInterval(timer.id);
      }
    });
    
    this.timers.clear();
  }
  
  size() {
    return this.timers.size;
  }
}

// ============================================
// OBSERVER MANAGER
// Tracks and cleans up Intersection/Mutation/Resize Observers
// ============================================
export class ObserverManager {
  constructor() {
    this.observers = new Map();
  }
  
  addIntersectionObserver(callback, options = {}) {
    const observer = new IntersectionObserver(callback, options);
    const key = Symbol('intersection-observer');
    
    this.observers.set(key, { observer, type: 'intersection' });
    
    return { key, observer };
  }
  
  addMutationObserver(callback) {
    const observer = new MutationObserver(callback);
    const key = Symbol('mutation-observer');
    
    this.observers.set(key, { observer, type: 'mutation' });
    
    return { key, observer };
  }
  
  addResizeObserver(callback) {
    const observer = new ResizeObserver(callback);
    const key = Symbol('resize-observer');
    
    this.observers.set(key, { observer, type: 'resize' });
    
    return { key, observer };
  }
  
  disconnect(key) {
    const item = this.observers.get(key);
    
    if (item) {
      item.observer.disconnect();
      this.observers.delete(key);
      return true;
    }
    
    return false;
  }
  
  disconnectAll() {
    this.observers.forEach((item) => {
      item.observer.disconnect();
    });
    
    this.observers.clear();
  }
  
  size() {
    return this.observers.size;
  }
}

// ============================================
// RESOURCE MANAGER
// Unified resource cleanup
// ============================================
export class ResourceManager {
  constructor() {
    this.eventManager = new EventListenerManager();
    this.timerManager = new TimerManager();
    this.observerManager = new ObserverManager();
    this.customCleanups = [];
  }
  
  addEventListener(target, event, handler, options) {
    return this.eventManager.add(target, event, handler, options);
  }
  
  setTimeout(callback, delay, ...args) {
    return this.timerManager.setTimeout(callback, delay, ...args);
  }
  
  setInterval(callback, delay, ...args) {
    return this.timerManager.setInterval(callback, delay, ...args);
  }
  
  addIntersectionObserver(callback, options) {
    return this.observerManager.addIntersectionObserver(callback, options);
  }
  
  addMutationObserver(callback) {
    return this.observerManager.addMutationObserver(callback);
  }
  
  addResizeObserver(callback) {
    return this.observerManager.addResizeObserver(callback);
  }
  
  addCustomCleanup(cleanup) {
    if (typeof cleanup === 'function') {
      this.customCleanups.push(cleanup);
    }
  }
  
  cleanup() {
    // Clean up all resources
    this.eventManager.removeAll();
    this.timerManager.clearAll();
    this.observerManager.disconnectAll();
    
    // Run custom cleanups
    this.customCleanups.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in custom cleanup:', error);
      }
    });
    
    this.customCleanups = [];
  }
  
  getStats() {
    return {
      eventListeners: this.eventManager.size(),
      timers: this.timerManager.size(),
      observers: this.observerManager.size(),
      customCleanups: this.customCleanups.length
    };
  }
}

// ============================================
// REACT HOOK FOR RESOURCE MANAGEMENT
// ============================================
export const createResourceManager = () => {
  const manager = new ResourceManager();
  
  return {
    manager,
    cleanup: () => manager.cleanup(),
    stats: () => manager.getStats()
  };
};

// ============================================
// WEAK REFERENCE CACHE
// Allows garbage collection of cached items
// ============================================
export class WeakCache {
  constructor() {
    this.cache = new WeakMap();
    this.keyMap = new Map();
  }
  
  set(key, value) {
    // Store object references in WeakMap
    if (typeof key === 'object' && key !== null) {
      this.cache.set(key, value);
    } else {
      // Primitive keys go in regular Map
      this.keyMap.set(key, value);
    }
  }
  
  get(key) {
    if (typeof key === 'object' && key !== null) {
      return this.cache.get(key);
    }
    return this.keyMap.get(key);
  }
  
  has(key) {
    if (typeof key === 'object' && key !== null) {
      return this.cache.has(key);
    }
    return this.keyMap.has(key);
  }
  
  delete(key) {
    if (typeof key === 'object' && key !== null) {
      return this.cache.delete(key);
    }
    return this.keyMap.delete(key);
  }
  
  clear() {
    // Can only clear the primitive key map
    this.keyMap.clear();
    // WeakMap entries will be garbage collected
  }
}
