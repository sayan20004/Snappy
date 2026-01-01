/**
 * Secure Storage Utility
 * Provides encrypted token storage with expiration and security features
 */

const STORAGE_KEY = '__app_secure_token__';
const REFRESH_KEY = '__app_refresh_token__';
const EXPIRY_KEY = '__app_token_expiry__';

/**
 * Simple encryption/decryption using XOR cipher with rotating key
 * Note: This is obfuscation, not real encryption. For production,
 * consider using Web Crypto API or storing tokens in httpOnly cookies
 */
class SecureStorage {
  constructor() {
    this.encryptionKey = this.generateKey();
  }

  /**
   * Generate a pseudo-random key from browser fingerprint
   */
  generateKey() {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height,
      navigator.hardwareConcurrency || 0
    ].join('|');

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Simple XOR encryption with rotating key
   */
  encrypt(text) {
    if (!text) return '';
    const key = this.encryptionKey;
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const textChar = text.charCodeAt(i);
      encrypted += String.fromCharCode(textChar ^ keyChar);
    }
    return btoa(encrypted); // Base64 encode
  }

  /**
   * Simple XOR decryption with rotating key
   */
  decrypt(encrypted) {
    if (!encrypted) return '';
    try {
      const decoded = atob(encrypted); // Base64 decode
      const key = this.encryptionKey;
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedChar = decoded.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * Store token with encryption and expiration
   */
  setToken(token, expiresIn = 24 * 60 * 60 * 1000) { // 24 hours default
    if (!token) {
      this.removeToken();
      return;
    }

    try {
      const encrypted = this.encrypt(token);
      const expiry = Date.now() + expiresIn;

      localStorage.setItem(STORAGE_KEY, encrypted);
      localStorage.setItem(EXPIRY_KEY, expiry.toString());

      // Set a flag to indicate token is present (without exposing value)
      sessionStorage.setItem('__token_active__', 'true');
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  /**
   * Retrieve and decrypt token
   */
  getToken() {
    try {
      // Check if token has expired
      const expiry = localStorage.getItem(EXPIRY_KEY);
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        this.removeToken();
        return null;
      }

      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return null;

      const token = this.decrypt(encrypted);
      return token || null;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token) {
    if (!token) {
      localStorage.removeItem(REFRESH_KEY);
      return;
    }

    try {
      const encrypted = this.encrypt(token);
      localStorage.setItem(REFRESH_KEY, encrypted);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    try {
      const encrypted = localStorage.getItem(REFRESH_KEY);
      if (!encrypted) return null;

      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Remove all tokens
   */
  removeToken() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem('__token_active__');
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken() {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) return false;

    return Date.now() <= parseInt(expiry, 10);
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry() {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Refresh token expiry (extend session)
   */
  extendSession(additionalTime = 60 * 60 * 1000) { // 1 hour default
    const currentExpiry = this.getTokenExpiry();
    if (currentExpiry) {
      const newExpiry = Date.now() + additionalTime;
      localStorage.setItem(EXPIRY_KEY, newExpiry.toString());
    }
  }
}

// Export singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;

/**
 * XSS Prevention Utilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize HTML content (for rich text)
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return html;

  // Remove script tags and event handlers
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  return clean;
}

/**
 * Create a safe DOM element with sanitized content
 */
export function createSafeElement(tag, content, attributes = {}) {
  const element = document.createElement(tag);
  
  // Set text content (automatically escapes)
  if (content) {
    element.textContent = content;
  }

  // Set safe attributes
  const safeAttributes = ['class', 'id', 'data-*', 'aria-*'];
  Object.entries(attributes).forEach(([key, value]) => {
    if (safeAttributes.some(safe => key.startsWith(safe.replace('*', '')))) {
      element.setAttribute(key, value);
    }
  });

  return element;
}

/**
 * Validate and sanitize URL to prevent javascript: protocol
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return '#';

  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => trimmed.startsWith(protocol))) {
    return '#';
  }

  // Allow only safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/'];
  const isSafe = safeProtocols.some(protocol => 
    trimmed.startsWith(protocol) || trimmed.startsWith(protocol.replace(':', ''))
  );

  return isSafe ? url : '#';
}

/**
 * Content Security Policy Meta Tag Generator
 */
export function generateCSPMeta() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' " + import.meta.env.VITE_API_URL,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  
  return meta;
}
