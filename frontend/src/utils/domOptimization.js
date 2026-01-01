/**
 * DOM Optimization Utilities
 * Avoiding unnecessary reflows and repaints
 */

// ============================================
// BATCH DOM OPERATIONS
// Reduces reflows by batching DOM changes
// ============================================
export const batchDOMOperations = {
  /**
   * Batch multiple element creations
   */
  createElements: (elements) => {
    const fragment = document.createDocumentFragment();
    
    elements.forEach(({ tag, attributes = {}, children = [], textContent }) => {
      const element = document.createElement(tag);
      
      // Set attributes
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Set text content
      if (textContent) {
        element.textContent = textContent;
      }
      
      // Append children
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
      
      fragment.appendChild(element);
    });
    
    return fragment;
  },

  /**
   * Batch style updates
   */
  updateStyles: (element, styles) => {
    // Use cssText for better performance
    const cssText = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${value}`)
      .join(';');
    
    element.style.cssText += cssText;
  },

  /**
   * Virtual scroll implementation for large lists
   */
  virtualScroll: {
    items: [],
    container: null,
    itemHeight: 50,
    visibleCount: 0,
    
    init(container, items, itemHeight = 50) {
      this.container = container;
      this.items = items;
      this.itemHeight = itemHeight;
      this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 1;
      
      // Set total height
      const totalHeight = items.length * itemHeight;
      container.style.height = `${totalHeight}px`;
      container.style.position = 'relative';
      
      return this;
    },
    
    render(scrollTop) {
      const startIndex = Math.floor(scrollTop / this.itemHeight);
      const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);
      
      const fragment = document.createDocumentFragment();
      
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.items[i];
        const element = this.createItemElement(item, i);
        fragment.appendChild(element);
      }
      
      return fragment;
    },
    
    createItemElement(item, index) {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = `${index * this.itemHeight}px`;
      div.style.height = `${this.itemHeight}px`;
      div.textContent = item.toString();
      return div;
    }
  }
};

// ============================================
// READ/WRITE DOM OPERATIONS SEPARATOR
// Batch reads, then batch writes
// ============================================
export class DOMBatcher {
  constructor() {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }
  
  measureRead(callback) {
    this.reads.push(callback);
    this.schedule();
  }
  
  mutateWrite(callback) {
    this.writes.push(callback);
    this.schedule();
  }
  
  schedule() {
    if (this.scheduled) return;
    
    this.scheduled = true;
    requestAnimationFrame(() => {
      // Execute all reads first
      this.reads.forEach(read => read());
      this.reads = [];
      
      // Then execute all writes
      this.writes.forEach(write => write());
      this.writes = [];
      
      this.scheduled = false;
    });
  }
  
  clear() {
    this.reads = [];
    this.writes = [];
    this.scheduled = false;
  }
}

// ============================================
// WILL-CHANGE OPTIMIZATION
// Hint to browser about upcoming changes
// ============================================
export const willChangeOptimization = {
  add(element, properties) {
    element.style.willChange = properties;
  },
  
  remove(element) {
    // Remove will-change after animation completes
    element.style.willChange = 'auto';
  },
  
  temporary(element, properties, duration = 1000) {
    this.add(element, properties);
    setTimeout(() => this.remove(element), duration);
  }
};

// ============================================
// PREVENT LAYOUT THRASHING
// Cache layout properties
// ============================================
export class LayoutCache {
  constructor(element) {
    this.element = element;
    this.cache = new Map();
  }
  
  get(property) {
    if (!this.cache.has(property)) {
      this.cache.set(property, this.element[property]);
    }
    return this.cache.get(property);
  }
  
  invalidate(property) {
    if (property) {
      this.cache.delete(property);
    } else {
      this.cache.clear();
    }
  }
  
  measure() {
    return {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      top: this.element.offsetTop,
      left: this.element.offsetLeft
    };
  }
}

// ============================================
// OFFSCREEN CANVAS FOR HEAVY OPERATIONS
// ============================================
export const offscreenOperation = (operation) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.left = '-9999px';
  
  document.body.appendChild(container);
  
  const result = operation(container);
  
  document.body.removeChild(container);
  
  return result;
};
