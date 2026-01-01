/**
 * React Performance Hooks
 * Custom hooks for performance optimization and memory management
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { debounce, throttle } from './performance';
import { ResourceManager } from './memoryManagement';

// ============================================
// USE DEBOUNCED VALUE
// Debounces a value update
// ============================================
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================
// USE DEBOUNCED CALLBACK
// Creates a debounced version of a callback
// ============================================
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      debounce((...args) => {
        callbackRef.current(...args);
      }, delay),
    [delay, ...deps]
  );
};

// ============================================
// USE THROTTLED CALLBACK
// Creates a throttled version of a callback
// ============================================
export const useThrottledCallback = (callback, limit = 300, deps = []) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useMemo(
    () =>
      throttle((...args) => {
        callbackRef.current(...args);
      }, limit),
    [limit, ...deps]
  );
};

// ============================================
// USE RESOURCE MANAGER
// Automatically cleanup resources on unmount
// ============================================
export const useResourceManager = () => {
  const managerRef = useRef(new ResourceManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
};

// ============================================
// USE EVENT LISTENER
// Adds event listener with automatic cleanup
// ============================================
export const useEventListener = (
  eventName,
  handler,
  element = window,
  options = {}
) => {
  const savedHandler = useRef();
  const resourceManager = useResourceManager();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener = (event) => savedHandler.current(event);

    resourceManager.addEventListener(
      element,
      eventName,
      eventListener,
      options
    );

    return () => {
      resourceManager.cleanup();
    };
  }, [eventName, element, options, resourceManager]);
};

// ============================================
// USE INTERVAL
// setInterval with automatic cleanup
// ============================================
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();
  const resourceManager = useResourceManager();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    resourceManager.setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      resourceManager.cleanup();
    };
  }, [delay, resourceManager]);
};

// ============================================
// USE TIMEOUT
// setTimeout with automatic cleanup
// ============================================
export const useTimeout = (callback, delay) => {
  const savedCallback = useRef();
  const resourceManager = useResourceManager();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    resourceManager.setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => {
      resourceManager.cleanup();
    };
  }, [delay, resourceManager]);
};

// ============================================
// USE INTERSECTION OBSERVER
// Observe element visibility
// ============================================
export const useIntersectionObserver = (
  elementRef,
  options = {},
  callback
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const resourceManager = useResourceManager();

  useEffect(() => {
    if (!elementRef.current) return;

    const { observer } = resourceManager.addIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          callback?.(entry);
        });
      },
      options
    );

    observer.observe(elementRef.current);

    return () => {
      resourceManager.cleanup();
    };
  }, [elementRef, options, callback, resourceManager]);

  return isIntersecting;
};

// ============================================
// USE RESIZE OBSERVER
// Observe element size changes
// ============================================
export const useResizeObserver = (elementRef, callback) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const resourceManager = useResourceManager();

  useEffect(() => {
    if (!elementRef.current) return;

    const { observer } = resourceManager.addResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        callback?.({ width, height });
      });
    });

    observer.observe(elementRef.current);

    return () => {
      resourceManager.cleanup();
    };
  }, [elementRef, callback, resourceManager]);

  return size;
};

// ============================================
// USE PREVIOUS VALUE
// Get previous value of a prop or state
// ============================================
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// ============================================
// USE UPDATE EFFECT
// useEffect that skips the first render
// ============================================
export const useUpdateEffect = (effect, deps) => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
};

// ============================================
// USE MOUNT EFFECT
// Effect that only runs on mount
// ============================================
export const useMountEffect = (effect) => {
  useEffect(() => {
    return effect();
  }, []);
};

// ============================================
// USE UNMOUNT EFFECT
// Effect that only runs on unmount
// ============================================
export const useUnmountEffect = (effect) => {
  useEffect(() => {
    return () => {
      effect();
    };
  }, []);
};

// ============================================
// USE WINDOW SIZE
// Track window dimensions
// ============================================
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handleResize = useThrottledCallback(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 100);

  useEventListener('resize', handleResize);

  return size;
};

// ============================================
// USE MEDIA QUERY
// React to media query changes
// ============================================
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
};

// ============================================
// USE LOCAL STORAGE
// Synced state with localStorage
// ============================================
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// ============================================
// USE ASYNC
// Handle async operations with loading and error states
// ============================================
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (error) {
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
};

// ============================================
// USE TOGGLE
// Boolean state toggle
// ============================================
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
};
