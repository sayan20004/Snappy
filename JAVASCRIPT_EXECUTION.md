# How JavaScript Works in the Browser

## 🧠 JavaScript Engine Architecture

### Overview
JavaScript is a single-threaded, non-blocking, asynchronous, concurrent language with a lot of flexibility.

## 📚 Core Concepts

### 1. Call Stack

The **Call Stack** is a data structure that records where in the program we are. It uses LIFO (Last In, First Out) principle.

```javascript
function multiply(a, b) {
  return a * b;
}

function square(n) {
  return multiply(n, n);  // multiply() pushed to stack
}

function printSquare(n) {
  const squared = square(n);  // square() pushed to stack
  console.log(squared);
}

printSquare(4);
// Stack: printSquare() -> square() -> multiply()
```

**Call Stack Flow:**
1. `printSquare(4)` is called → pushed to stack
2. `square(4)` is called → pushed to stack
3. `multiply(4, 4)` is called → pushed to stack
4. `multiply` returns 16 → popped from stack
5. `square` returns 16 → popped from stack
6. `console.log(16)` executes
7. `printSquare` completes → popped from stack

**Stack Overflow:**
```javascript
function recursiveFunction() {
  recursiveFunction(); // No base case!
}

recursiveFunction(); // RangeError: Maximum call stack size exceeded
```

### 2. Web APIs

**Web APIs** are provided by the browser (not part of JavaScript itself):

- DOM API (`document.querySelector()`)
- setTimeout/setInterval
- fetch API
- XMLHttpRequest
- localStorage
- console
- WebSocket
- IntersectionObserver
- ResizeObserver
- Geolocation API

```javascript
// setTimeout is a Web API, not JavaScript
setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);

// fetch is also a Web API
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

### 3. Event Loop & Task Queue

The **Event Loop** is the mechanism that coordinates the Call Stack with the Task Queue.

#### Task Queue (Macrotask Queue)
Handles:
- setTimeout callbacks
- setInterval callbacks
- I/O operations
- UI rendering
- postMessage
- MessageChannel

#### Microtask Queue
Handles:
- Promise callbacks (.then, .catch, .finally)
- queueMicrotask
- MutationObserver
- process.nextTick (Node.js)

**Priority:** Microtasks execute before Macrotasks

### 4. Complete Execution Model

```
┌───────────────────────────┐
│      Call Stack           │ ← Executes JavaScript code
└───────────────────────────┘
            ↕
┌───────────────────────────┐
│      Web APIs             │ ← Browser features
│  - setTimeout             │
│  - fetch                  │
│  - DOM events             │
└───────────────────────────┘
            ↓
┌───────────────────────────┐
│   Microtask Queue         │ ← Higher priority
│  - Promises               │
│  - queueMicrotask         │
└───────────────────────────┘
            ↓
┌───────────────────────────┐
│   Macrotask Queue         │ ← Lower priority
│  - setTimeout             │
│  - setInterval            │
│  - I/O                    │
└───────────────────────────┘
            ↑
      Event Loop
```

## 🔄 Execution Examples

### Example 1: Synchronous vs Asynchronous

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

console.log('3');

// Output:
// 1
// 3
// 2

// Why?
// 1. console.log('1') → Call Stack → executes immediately
// 2. setTimeout() → Web API → callback queued in Task Queue
// 3. console.log('3') → Call Stack → executes immediately
// 4. Event Loop checks: Stack empty? Yes → Move task to Stack
// 5. console.log('2') executes
```

### Example 2: Promises vs setTimeout

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('End');

// Output:
// Start
// End
// Promise
// Timeout

// Why?
// 1. Synchronous code executes first (Start, End)
// 2. Microtasks (Promise) execute before Macrotasks (setTimeout)
// 3. Promise callback executes
// 4. setTimeout callback executes last
```

### Example 3: Nested Timers

```javascript
setTimeout(() => {
  console.log('Timeout 1');
  
  Promise.resolve().then(() => {
    console.log('Promise in Timeout 1');
  });
}, 0);

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
});

// Output:
// Promise 1
// Timeout 1
// Promise in Timeout 1
// Timeout 2

// Explanation:
// 1. Promise 1 (microtask) executes first
// 2. Timeout 1 (macrotask) executes
// 3. Promise in Timeout 1 (microtask) executes before next macrotask
// 4. Timeout 2 (macrotask) executes
```

### Example 4: Complex Event Loop

```javascript
console.log('Script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
  })
  .then(() => {
    console.log('Promise 2');
  });

requestAnimationFrame(() => {
  console.log('requestAnimationFrame');
});

console.log('Script end');

// Output:
// Script start
// Script end
// Promise 1
// Promise 2
// requestAnimationFrame
// setTimeout
```

## 🎯 Practical Applications

### Debouncing Implementation

```javascript
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    // Clear previous timeout (uses Web API)
    clearTimeout(timeoutId);
    
    // Set new timeout (uses Web API)
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// Only last call within 300ms executes
handleSearch('a');
handleSearch('ab');
handleSearch('abc'); // Only this executes after 300ms
```

### Throttling Implementation

```javascript
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      // Uses Web API
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log('Scroll event');
}, 100);

// Executes maximum once every 100ms
window.addEventListener('scroll', handleScroll);
```

### Async Operation Queue

```javascript
class AsyncQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      // Process next task asynchronously
      this.process();
    }
  }
}

// Usage
const queue = new AsyncQueue();

queue.add(() => fetch('/api/data1'));
queue.add(() => fetch('/api/data2'));
queue.add(() => fetch('/api/data3'));
// Tasks execute sequentially
```

## 🔍 Event Loop Algorithm

```
while (true) {
  // 1. Execute all synchronous code in Call Stack
  if (callStack.isEmpty()) {
    
    // 2. Execute ALL microtasks
    while (microtaskQueue.hasItems()) {
      task = microtaskQueue.dequeue();
      callStack.push(task);
      execute(task);
    }
    
    // 3. Render if needed (browser only)
    if (needsRendering) {
      render();
    }
    
    // 4. Execute ONE macrotask
    if (macrotaskQueue.hasItems()) {
      task = macrotaskQueue.dequeue();
      callStack.push(task);
      execute(task);
    }
  }
}
```

## 🎨 Render Pipeline

Browser rendering happens between Event Loop iterations:

1. **JavaScript execution** (Call Stack)
2. **Microtasks** (Promises)
3. **Render** (if needed)
   - Style calculation
   - Layout
   - Paint
   - Composite
4. **Macrotask** (setTimeout, etc.)

### RequestAnimationFrame

```javascript
// Executes before next repaint
requestAnimationFrame(() => {
  // Perfect for animations
  element.style.transform = 'translateX(100px)';
});

// vs setTimeout (may cause jank)
setTimeout(() => {
  element.style.transform = 'translateX(100px)';
}, 16); // Tries to match 60fps, but not synchronized
```

## 🐛 Common Pitfalls

### Blocking the Event Loop

```javascript
// BAD: Blocks the event loop
function blockingOperation() {
  const end = Date.now() + 5000;
  while (Date.now() < end) {
    // Blocking for 5 seconds
  }
}

blockingOperation(); // UI freezes!

// GOOD: Non-blocking
async function nonBlockingOperation() {
  await new Promise(resolve => setTimeout(resolve, 5000));
}

nonBlockingOperation(); // UI remains responsive
```

### Promise Trap

```javascript
// BAD: Unnecessary nesting
getData()
  .then(result1 => {
    return getMoreData(result1)
      .then(result2 => {
        return getEvenMoreData(result2)
          .then(result3 => {
            return result3;
          });
      });
  });

// GOOD: Flat chain
getData()
  .then(result1 => getMoreData(result1))
  .then(result2 => getEvenMoreData(result2))
  .then(result3 => result3);

// BEST: Async/await
async function fetchData() {
  const result1 = await getData();
  const result2 = await getMoreData(result1);
  const result3 = await getEvenMoreData(result2);
  return result3;
}
```

## 📊 Performance Monitoring

```javascript
// Measure execution time
console.time('operation');
// ... code ...
console.timeEnd('operation');

// Monitor call stack
console.trace();

// Memory usage
console.log(performance.memory);

// Task timing
const start = performance.now();
await someAsyncTask();
const end = performance.now();
console.log(`Task took ${end - start}ms`);
```

## 🎓 Key Takeaways

1. **JavaScript is single-threaded** - One Call Stack
2. **Asynchronous ≠ Multi-threaded** - Uses Event Loop
3. **Microtasks before Macrotasks** - Promises execute first
4. **Web APIs handle async** - Browser features, not JS
5. **Event Loop never blocks** - Unless you block it!
6. **Understanding helps debugging** - Know your execution model
7. **requestAnimationFrame for animations** - Synchronized with render
8. **Avoid blocking operations** - Keep Event Loop responsive

## 🔗 Related Patterns in This Project

- **Debouncing**: `utils/performance.js`
- **Throttling**: `utils/performance.js`
- **Async Queue**: `backend/utils/performance.js`
- **Event Loop optimized code**: Throughout the application
- **Non-blocking operations**: Resource managers, lazy loading
- **Microtask scheduling**: Promise-based utilities

---

**Understanding the Event Loop is crucial for writing performant JavaScript applications!**
