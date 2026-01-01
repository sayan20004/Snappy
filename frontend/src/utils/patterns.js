/**
 * Design Patterns in JavaScript
 * Module Pattern, Revealing Module, Factory, Singleton, Observer
 */

// ============================================
// MODULE PATTERN (IIFE Based)
// Encapsulates private variables and methods
// ============================================
export const CounterModule = (function() {
  // Private variables
  let count = 0;
  let listeners = [];
  
  // Private methods
  function notifyListeners() {
    listeners.forEach(listener => listener(count));
  }
  
  function validateNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }
  
  // Public API
  return {
    increment() {
      count++;
      notifyListeners();
      return count;
    },
    
    decrement() {
      count--;
      notifyListeners();
      return count;
    },
    
    getValue() {
      return count;
    },
    
    setValue(value) {
      if (validateNumber(value)) {
        count = value;
        notifyListeners();
        return true;
      }
      return false;
    },
    
    reset() {
      count = 0;
      notifyListeners();
    },
    
    subscribe(listener) {
      if (typeof listener === 'function') {
        listeners.push(listener);
        return () => {
          listeners = listeners.filter(l => l !== listener);
        };
      }
    }
  };
})();

// ============================================
// REVEALING MODULE PATTERN
// More explicit about what's public
// ============================================
export const TodoService = (function() {
  // Private state
  let todos = [];
  let nextId = 1;
  
  // Private methods
  function findTodoById(id) {
    return todos.find(todo => todo.id === id);
  }
  
  function validateTodo(todo) {
    return todo && typeof todo.title === 'string' && todo.title.trim().length > 0;
  }
  
  // Public methods
  function addTodo(title, description = '') {
    const todo = {
      id: nextId++,
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    if (validateTodo(todo)) {
      todos.push(todo);
      return { success: true, todo };
    }
    
    return { success: false, error: 'Invalid todo' };
  }
  
  function removeTodo(id) {
    const index = todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      const removed = todos.splice(index, 1)[0];
      return { success: true, todo: removed };
    }
    return { success: false, error: 'Todo not found' };
  }
  
  function updateTodo(id, updates) {
    const todo = findTodoById(id);
    if (todo) {
      Object.assign(todo, updates, { updatedAt: new Date().toISOString() });
      return { success: true, todo };
    }
    return { success: false, error: 'Todo not found' };
  }
  
  function getTodos(filter = 'all') {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'active':
        return todos.filter(todo => !todo.completed);
      default:
        return [...todos];
    }
  }
  
  function clearCompleted() {
    const removed = todos.filter(todo => todo.completed);
    todos = todos.filter(todo => !todo.completed);
    return { success: true, removed };
  }
  
  function getStats() {
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    };
  }
  
  // Reveal public API
  return {
    add: addTodo,
    remove: removeTodo,
    update: updateTodo,
    getAll: getTodos,
    clearCompleted,
    getStats
  };
})();

// ============================================
// FACTORY PATTERN
// Creates objects without specifying exact class
// ============================================
export const UserFactory = {
  createUser(type, data) {
    const baseUser = {
      id: data.id || Date.now(),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
      ...data
    };
    
    switch (type) {
      case 'admin':
        return {
          ...baseUser,
          type: 'admin',
          permissions: ['read', 'write', 'delete', 'manage'],
          role: 'administrator',
          canManageUsers() {
            return true;
          },
          getPermissions() {
            return this.permissions;
          }
        };
        
      case 'editor':
        return {
          ...baseUser,
          type: 'editor',
          permissions: ['read', 'write'],
          role: 'editor',
          canManageUsers() {
            return false;
          },
          getPermissions() {
            return this.permissions;
          }
        };
        
      case 'viewer':
        return {
          ...baseUser,
          type: 'viewer',
          permissions: ['read'],
          role: 'viewer',
          canManageUsers() {
            return false;
          },
          getPermissions() {
            return this.permissions;
          }
        };
        
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  },
  
  createGuest() {
    return this.createUser('viewer', {
      id: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@example.com',
      isGuest: true
    });
  }
};

// ============================================
// FACTORY FUNCTION PATTERN
// Alternative to classes
// ============================================
export function createTodo(title, options = {}) {
  // Private state
  let completed = false;
  let priority = options.priority || 'medium';
  
  // Return public interface
  return {
    id: options.id || Date.now(),
    title,
    description: options.description || '',
    
    // Getters
    isCompleted() {
      return completed;
    },
    
    getPriority() {
      return priority;
    },
    
    // Setters
    toggle() {
      completed = !completed;
      return completed;
    },
    
    complete() {
      completed = true;
      return this;
    },
    
    setPriority(newPriority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (validPriorities.includes(newPriority)) {
        priority = newPriority;
        return true;
      }
      return false;
    },
    
    // Methods
    toJSON() {
      return {
        id: this.id,
        title: this.title,
        description: this.description,
        completed,
        priority
      };
    }
  };
}

// ============================================
// SINGLETON PATTERN
// Ensures only one instance exists
// ============================================
export const AppConfig = (function() {
  let instance;
  
  function createInstance() {
    const config = {
      apiUrl: '',
      theme: 'light',
      language: 'en',
      features: new Set(),
      
      setApiUrl(url) {
        this.apiUrl = url;
      },
      
      setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
          this.theme = theme;
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
      
      setLanguage(lang) {
        this.language = lang;
      },
      
      enableFeature(feature) {
        this.features.add(feature);
      },
      
      disableFeature(feature) {
        this.features.delete(feature);
      },
      
      isFeatureEnabled(feature) {
        return this.features.has(feature);
      },
      
      getConfig() {
        return {
          apiUrl: this.apiUrl,
          theme: this.theme,
          language: this.language,
          features: Array.from(this.features)
        };
      }
    };
    
    return config;
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
// BUILDER PATTERN
// Constructs complex objects step by step
// ============================================
export class QueryBuilder {
  constructor() {
    this.query = {
      filters: [],
      sort: null,
      limit: null,
      skip: null
    };
  }
  
  where(field, operator, value) {
    this.query.filters.push({ field, operator, value });
    return this;
  }
  
  sortBy(field, order = 'asc') {
    this.query.sort = { field, order };
    return this;
  }
  
  limitTo(count) {
    this.query.limit = count;
    return this;
  }
  
  skipBy(count) {
    this.query.skip = count;
    return this;
  }
  
  build() {
    return { ...this.query };
  }
  
  execute(data) {
    let result = [...data];
    
    // Apply filters
    this.query.filters.forEach(({ field, operator, value }) => {
      result = result.filter(item => {
        switch (operator) {
          case '===': return item[field] === value;
          case '!==': return item[field] !== value;
          case '>': return item[field] > value;
          case '<': return item[field] < value;
          case '>=': return item[field] >= value;
          case '<=': return item[field] <= value;
          case 'includes': return item[field]?.includes(value);
          default: return true;
        }
      });
    });
    
    // Apply sorting
    if (this.query.sort) {
      const { field, order } = this.query.sort;
      result.sort((a, b) => {
        if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Apply skip
    if (this.query.skip) {
      result = result.slice(this.query.skip);
    }
    
    // Apply limit
    if (this.query.limit) {
      result = result.slice(0, this.query.limit);
    }
    
    return result;
  }
}
