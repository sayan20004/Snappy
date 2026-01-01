# 🚀 Quick Reference Guide

## Design Patterns

### Using Module Pattern
```javascript
import { CounterModule } from './utils/patterns';

const count = CounterModule.getValue();
CounterModule.increment();
const unsubscribe = CounterModule.subscribe((newCount) => {
  console.log('Count changed:', newCount);
});
```

### Using Factory Pattern
```javascript
import { UserFactory } from './utils/patterns';

const admin = UserFactory.createUser('admin', {
  name: 'John',
  email: 'john@example.com'
});

console.log(admin.canManageUsers()); // true
```

### Using Observer Pattern
```javascript
import { EventEmitter } from './utils/observer';

const events = new EventEmitter();

// Subscribe
const unsubscribe = events.on('dataUpdate', (data) => {
  console.log('Data updated:', data);
});

// Emit
events.emit('dataUpdate', { id: 1, value: 'new' });

// Unsubscribe
unsubscribe();
```

### Using Observable (Reactive)
```javascript
import { Observable } from './utils/observer';

const counter = new Observable(0);

counter.subscribe((value) => {
  console.log('Counter:', value);
});

counter.value = 1; // Triggers subscriber
counter.update(val => val + 1); // Increment
```

## Performance Optimizations

### Debouncing
```javascript
import { useDebouncedCallback } from './hooks/usePerformance';

function SearchComponent() {
  const handleSearch = useDebouncedCallback((query) => {
    fetch(`/api/search?q=${query}`);
  }, 300);

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### Throttling
```javascript
import { useThrottledCallback } from './hooks/usePerformance';

function ScrollComponent() {
  const handleScroll = useThrottledCallback(() => {
    console.log('Scroll position:', window.scrollY);
  }, 100);

  useEventListener('scroll', handleScroll);
}
```

### Lazy Loading Images
```javascript
import { LazyImage } from './utils/lazyLoading';

function Gallery() {
  return (
    <LazyImage
      src="/large-image.jpg"
      alt="Description"
      placeholder="data:image/svg+xml,..."
      threshold={0.01}
      rootMargin="50px"
    />
  );
}
```

### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

### Memory Management
```javascript
import { useResourceManager } from './hooks/usePerformance';

function Component() {
  const resources = useResourceManager();

  useEffect(() => {
    // Add event listener
    resources.addEventListener(window, 'scroll', handleScroll);
    
    // Add timer
    resources.setInterval(() => console.log('tick'), 1000);
    
    // Automatic cleanup on unmount
  }, []);
}
```

## Backend Patterns

### Using Repository Pattern
```javascript
import { BaseRepository } from './patterns';
import Todo from './models/Todo.model';

class TodoRepository extends BaseRepository {
  constructor() {
    super(Todo);
  }

  async findByUser(userId) {
    return this.findAll({ user: userId });
  }
}

const todoRepo = new TodoRepository();
const todos = await todoRepo.findByUser(userId);
```

### Using Service Layer
```javascript
import { BaseService } from './patterns';
import { TodoRepository } from './repositories';

class TodoService extends BaseService {
  constructor() {
    super(new TodoRepository());
  }

  async getUserTodos(userId) {
    return this.getAll(userId, { sort: { createdAt: -1 } });
  }
}

const todoService = new TodoService();
```

### Using Response Factory
```javascript
import { ResponseFactory } from './patterns';

// Success response
res.json(ResponseFactory.success(data, 'Success message'));

// Error response
res.status(400).json(ResponseFactory.error('Error message', 'ERROR_CODE'));

// Paginated response
res.json(ResponseFactory.paginated(items, page, limit, total));
```

## Custom Hooks

### useDebouncedValue
```javascript
import { useDebouncedValue } from './hooks/usePerformance';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    // API call with debounced value
    searchAPI(debouncedSearch);
  }, [debouncedSearch]);
}
```

### useIntersectionObserver
```javascript
import { useIntersectionObserver } from './hooks/usePerformance';

function LazyComponent() {
  const ref = useRef();
  const isVisible = useIntersectionObserver(ref, { threshold: 0.5 });

  return (
    <div ref={ref}>
      {isVisible && <ExpensiveComponent />}
    </div>
  );
}
```

### useEventListener
```javascript
import { useEventListener } from './hooks/usePerformance';

function Component() {
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
```

## Utility Functions

### Deep Clone
```javascript
import { deepClone } from './utils/performance';

const original = { nested: { value: 1 }, arr: [1, 2, 3] };
const cloned = deepClone(original);
cloned.nested.value = 2; // original unchanged
```

### Memoization
```javascript
import { memoize } from './utils/performance';

const expensiveFunc = memoize((n) => {
  // Expensive computation
  return result;
}, { maxSize: 100, ttl: 60000 });

const result = expensiveFunc(10); // Computed
const cached = expensiveFunc(10); // From cache
```

### Batch DOM Operations
```javascript
import { batchDOMOperations } from './utils/domOptimization';

const fragment = batchDOMOperations.createElements([
  {
    tag: 'div',
    attributes: { className: 'card' },
    textContent: 'Content'
  },
  {
    tag: 'p',
    textContent: 'Paragraph'
  }
]);

container.appendChild(fragment);
```

## Performance Monitoring

### Measure Component Performance
```javascript
import { useEffect } from 'react';

function ExpensiveComponent() {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`Component took ${end - start}ms`);
    };
  }, []);
}
```

### Monitor Memory
```javascript
if (performance.memory) {
  console.log({
    used: performance.memory.usedJSHeapSize / 1048576,
    total: performance.memory.totalJSHeapSize / 1048576,
    limit: performance.memory.jsHeapSizeLimit / 1048576
  });
}
```

## Common Pitfalls to Avoid

### ❌ Don't: Infinite Loops
```javascript
// BAD
useEffect(() => {
  setState(value + 1);
}, [value]); // Infinite loop!

// GOOD
useEffect(() => {
  setState(initialValue);
}, []); // Run once
```

### ❌ Don't: Memory Leaks
```javascript
// BAD
useEffect(() => {
  window.addEventListener('scroll', handler);
  // No cleanup!
}, []);

// GOOD
useEffect(() => {
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []);
```

### ❌ Don't: Block Event Loop
```javascript
// BAD
function blockingOperation() {
  while (Date.now() < Date.now() + 5000) {
    // Blocks for 5 seconds!
  }
}

// GOOD
async function nonBlocking() {
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### ❌ Don't: Unnecessary Re-renders
```javascript
// BAD
function Component() {
  const config = { option: 'value' }; // New object every render!
  return <Child config={config} />;
}

// GOOD
function Component() {
  const config = useMemo(() => ({ option: 'value' }), []);
  return <Child config={config} />;
}
```

## Testing

### Test Utilities
```javascript
import { debounce, throttle } from './utils/performance';

describe('debounce', () => {
  it('delays execution', (done) => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    
    debounced();
    expect(fn).not.toHaveBeenCalled();
    
    setTimeout(() => {
      expect(fn).toHaveBeenCalledTimes(1);
      done();
    }, 150);
  });
});
```

## Production Deployment

### 1. Environment Setup
```bash
# Copy environment template
cp backend/.env.example backend/.env.production

# Edit with production values
nano backend/.env.production
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```

### 3. Start Backend
```bash
cd backend
pm2 start ecosystem.config.js --env production
```

### 4. Monitor
```bash
pm2 monit
pm2 logs
```

## Quick Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection string set
- [ ] JWT secrets are strong (64+ chars)
- [ ] CORS origins whitelisted
- [ ] Rate limiting configured
- [ ] SSL certificate installed
- [ ] Nginx reverse proxy setup
- [ ] PM2 process manager running
- [ ] Health check responding
- [ ] Logs are being written
- [ ] Backups configured
- [ ] Monitoring setup (optional)

## Support & Resources

- **Architecture**: See `ARCHITECTURE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **JavaScript Internals**: See `JAVASCRIPT_EXECUTION.md`
- **Full Summary**: See `OPTIMIZATION_SUMMARY.md`

---

**Happy coding! 🚀**
