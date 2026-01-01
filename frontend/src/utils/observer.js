/**
 * Observer Pattern Implementation
 * Pub/Sub system for event-driven architecture
 */

// ============================================
// SIMPLE OBSERVER PATTERN
// ============================================
export class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    if (typeof observer === 'function') {
      this.observers.push(observer);
      
      // Return unsubscribe function
      return () => {
        this.observers = this.observers.filter(obs => obs !== observer);
      };
    }
    
    throw new Error('Observer must be a function');
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => {
      try {
        observer(data);
      } catch (error) {
        console.error('Error in observer:', error);
      }
    });
  }
  
  clear() {
    this.observers = [];
  }
  
  getObserverCount() {
    return this.observers.length;
  }
}

// ============================================
// EVENT EMITTER (Named Events)
// ============================================
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push(listener);
    
    // Return unsubscribe function
    return () => this.off(event, listener);
  }
  
  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args);
      this.off(event, wrapper);
    };
    
    return this.on(event, wrapper);
  }
  
  off(event, listener) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    // Clean up empty arrays
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }
  
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
  
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  listenerCount(event) {
    return this.events.get(event)?.length || 0;
  }
  
  eventNames() {
    return Array.from(this.events.keys());
  }
}

// ============================================
// GLOBAL EVENT BUS (Singleton)
// ============================================
export const EventBus = (function() {
  let instance;
  
  function createInstance() {
    return new EventEmitter();
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// ============================================
// OBSERVABLE STATE (Reactive Programming)
// ============================================
export class Observable {
  constructor(initialValue) {
    this._value = initialValue;
    this._observers = new Set();
  }
  
  get value() {
    return this._value;
  }
  
  set value(newValue) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this._notify(newValue, oldValue);
    }
  }
  
  subscribe(observer) {
    this._observers.add(observer);
    
    // Immediately call with current value
    observer(this._value, undefined);
    
    // Return unsubscribe function
    return () => {
      this._observers.delete(observer);
    };
  }
  
  _notify(newValue, oldValue) {
    this._observers.forEach(observer => {
      try {
        observer(newValue, oldValue);
      } catch (error) {
        console.error('Error in observable observer:', error);
      }
    });
  }
  
  update(updater) {
    if (typeof updater === 'function') {
      this.value = updater(this._value);
    }
  }
  
  map(mapper) {
    const mapped = new Observable(mapper(this._value));
    
    this.subscribe((newValue) => {
      mapped.value = mapper(newValue);
    });
    
    return mapped;
  }
  
  filter(predicate) {
    const filtered = new Observable(
      predicate(this._value) ? this._value : undefined
    );
    
    this.subscribe((newValue) => {
      if (predicate(newValue)) {
        filtered.value = newValue;
      }
    });
    
    return filtered;
  }
}

// ============================================
// COMPUTED OBSERVABLE (Derived State)
// ============================================
export class ComputedObservable extends Observable {
  constructor(dependencies, computer) {
    super(computer(...dependencies.map(dep => dep.value)));
    
    this._dependencies = dependencies;
    this._computer = computer;
    
    // Subscribe to all dependencies
    dependencies.forEach(dep => {
      dep.subscribe(() => {
        this.value = this._computer(
          ...this._dependencies.map(d => d.value)
        );
      });
    });
  }
}

// ============================================
// STORE PATTERN (State Management)
// ============================================
export class Store {
  constructor(initialState = {}) {
    this._state = initialState;
    this._listeners = new Set();
    this._middlewares = [];
  }
  
  getState() {
    return { ...this._state };
  }
  
  setState(updater) {
    const oldState = this._state;
    
    // Handle function or object updater
    const newState = typeof updater === 'function'
      ? updater(oldState)
      : { ...oldState, ...updater };
    
    // Apply middlewares
    let finalState = newState;
    for (const middleware of this._middlewares) {
      finalState = middleware(finalState, oldState);
    }
    
    this._state = finalState;
    this._notify(finalState, oldState);
  }
  
  subscribe(listener) {
    this._listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this._listeners.delete(listener);
    };
  }
  
  use(middleware) {
    this._middlewares.push(middleware);
  }
  
  _notify(newState, oldState) {
    this._listeners.forEach(listener => {
      try {
        listener(newState, oldState);
      } catch (error) {
        console.error('Error in store listener:', error);
      }
    });
  }
  
  dispatch(action) {
    if (typeof action === 'function') {
      return action(this.getState(), this.setState.bind(this));
    }
  }
}

// ============================================
// PROPERTY OBSERVER (Deep Object Watching)
// ============================================
export function createObservableObject(target, callback) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      
      if (oldValue !== value) {
        callback({
          type: 'set',
          target: obj,
          property: prop,
          value,
          oldValue
        });
      }
      
      return true;
    },
    
    deleteProperty(obj, prop) {
      const oldValue = obj[prop];
      delete obj[prop];
      
      callback({
        type: 'delete',
        target: obj,
        property: prop,
        oldValue
      });
      
      return true;
    }
  });
}

// ============================================
// MESSAGE QUEUE (Async Observer)
// ============================================
export class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.handlers = new Map();
  }
  
  subscribe(messageType, handler) {
    if (!this.handlers.has(messageType)) {
      this.handlers.set(messageType, []);
    }
    
    this.handlers.get(messageType).push(handler);
    
    return () => {
      const handlers = this.handlers.get(messageType);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  publish(messageType, data) {
    this.queue.push({ messageType, data, timestamp: Date.now() });
    this.process();
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      const handlers = this.handlers.get(message.messageType) || [];
      
      for (const handler of handlers) {
        try {
          await handler(message.data);
        } catch (error) {
          console.error(`Error processing message "${message.messageType}":`, error);
        }
      }
    }
    
    this.processing = false;
  }
  
  clear() {
    this.queue = [];
  }
  
  size() {
    return this.queue.length;
  }
}
