/**
 * XSS Prevention Utilities
 * 
 * Provides utilities to prevent Cross-Site Scripting (XSS) attacks
 * in React components by sanitizing user input and dangerous HTML.
 * 
 * Note: For production with rich text, install DOMPurify: npm install dompurify
 */

/**
 * Basic HTML sanitization (without external dependencies)
 * For better security with rich content, use DOMPurify
 */
export const sanitizeHTML = (dirty, options = {}) => {
  if (typeof dirty !== 'string') return '';

  // Try to use DOMPurify if available
  if (typeof window !== 'undefined' && window.DOMPurify) {
    const defaultOptions = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
      ...options
    };
    return window.DOMPurify.sanitize(dirty, defaultOptions);
  }

  // Fallback: Basic sanitization
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Sanitize text input by removing dangerous characters
 * Use this for plain text inputs like titles, names, etc.
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') return '';

  const urlLower = url.toLowerCase().trim();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => urlLower.startsWith(protocol))) {
    return '';
  }

  // Only allow http, https, mailto, and relative URLs
  try {
    const parsed = new URL(url, window.location.origin);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (e) {
    // If URL parsing fails, return empty string
    return '';
  }

  return '';
};

/**
 * Escape HTML entities
 */
export const escapeHTML = (text) => {
  if (typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Unescape HTML entities
 */
export const unescapeHTML = (text) => {
  if (typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || '';
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize filename to prevent path traversal
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace dangerous chars
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+/, '') // Remove leading dots
    .slice(0, 255); // Limit length
};

/**
 * Content Security Policy helpers
 */
export const CSP = {
  // Generate nonce for inline scripts
  generateNonce: () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },

  // Check if CSP is supported
  isSupported: () => {
    return 'SecurityPolicyViolationEvent' in window;
  }
};

/**
 * React-specific XSS prevention hooks and components
 */
import React from 'react';

/**
 * Safe component wrapper for rendering user content
 * Usage: <SafeHTML html={userContent} />
 */
export const SafeHTML = ({ html, className = '', allowedTags = [] }) => {
  const sanitized = sanitizeHTML(html, {
    ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : undefined
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

/**
 * Hook to sanitize form input
 */
export const useSanitizedInput = (initialValue = '') => {
  const [value, setValue] = React.useState(sanitizeText(initialValue));

  const handleChange = (e) => {
    const sanitized = sanitizeText(e.target.value);
    setValue(sanitized);
  };

  return [value, handleChange, setValue];
};

/**
 * Validate and sanitize JSON data
 */
export const sanitizeJSON = (data) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  // Recursively sanitize object
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return sanitizeText(value);
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (value !== null && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[sanitizeText(key)] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  return sanitizeValue(data);
};

/**
 * Input validation patterns
 */
export const ValidationPatterns = {
  // Alphanumeric with spaces
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  
  // Letters only
  lettersOnly: /^[a-zA-Z\s]+$/,
  
  // Numbers only
  numbersOnly: /^[0-9]+$/,
  
  // Email
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // URL
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Phone (international format)
  phone: /^\+?[1-9]\d{1,14}$/,
  
  // Username (alphanumeric, underscore, hyphen)
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  
  // Strong password
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

/**
 * Validate input against pattern
 */
export const validateInput = (value, pattern) => {
  if (typeof pattern === 'string') {
    pattern = ValidationPatterns[pattern];
  }
  return pattern instanceof RegExp ? pattern.test(value) : false;
};

/**
 * Rate limiting for client-side actions
 */
export class ClientRateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  canProceed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }

  clear() {
    this.attempts.clear();
  }
}

/**
 * Security headers checker
 */
export const checkSecurityHeaders = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const headers = {};
    
    const securityHeaders = [
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security',
      'referrer-policy'
    ];

    securityHeaders.forEach(header => {
      headers[header] = response.headers.get(header) || 'Not set';
    });

    return headers;
  } catch (error) {
    console.error('Failed to check security headers:', error);
    return null;
  }
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeEmail,
  sanitizeFilename,
  escapeHTML,
  unescapeHTML,
  sanitizeJSON,
  SafeHTML,
  ValidationPatterns,
  validateInput,
  ClientRateLimiter,
  checkSecurityHeaders,
  CSP
};
