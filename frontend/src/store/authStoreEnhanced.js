/**
 * Enhanced Auth Store with Observer Pattern
 * Production-ready state management with middleware and observers
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EventEmitter } from '../utils/observer';
import secureStorage from '../utils/secureStorage.js';

// Global event emitter for auth events
const authEvents = new EventEmitter();

// Middleware for logging state changes (development only)
const loggerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth Store] Previous State:', get());
        set(...args);
        console.log('[Auth Store] New State:', get());
      } else {
        set(...args);
      }
    },
    get,
    api
  );

// Middleware for emitting events on state changes
const observerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      const prevState = get();
      set(...args);
      const nextState = get();

      // Emit auth events
      if (prevState.isAuthenticated !== nextState.isAuthenticated) {
        if (nextState.isAuthenticated) {
          authEvents.emit('login', nextState.user);
        } else {
          authEvents.emit('logout');
        }
      }

      if (prevState.user !== nextState.user && nextState.user) {
        authEvents.emit('userUpdate', nextState.user);
      }

      authEvents.emit('stateChange', { prevState, nextState });
    },
    get,
    api
  );

export const useAuthStore = create(
  loggerMiddleware(
    observerMiddleware(
      persist(
        (set, get) => ({
          user: null,
          token: null,
          isAuthenticated: false,
          _hasHydrated: false,
          loading: false,
          error: null,

          // Hydration
          setHasHydrated: (state) => {
            set({ _hasHydrated: state });
          },

          // Authentication
          setAuth: (user, token) => {
            secureStorage.setToken(token);
            set({
              user,
              token,
              isAuthenticated: true,
              error: null
            });
          },

          logout: () => {
            secureStorage.removeToken();
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null
            });
          },

          // User updates
          updateUser: (userData) => {
            set((state) => ({
              user: { ...state.user, ...userData }
            }));
          },

          // Loading state
          setLoading: (loading) => {
            set({ loading });
          },

          // Error handling
          setError: (error) => {
            set({ error });
          },

          clearError: () => {
            set({ error: null });
          },

          // Getters
          getToken: () => {
            return get().token || secureStorage.getToken();
          },

          isAdmin: () => {
            return get().user?.role === 'admin';
          },

          hasPermission: (permission) => {
            const user = get().user;
            return user?.permissions?.includes(permission) || false;
          }
        }),
        {
          name: 'auth-storage',
          skipHydration: false,
          partialize: (state) => ({
            user: state.user,
            token: state.token,
            isAuthenticated: state.isAuthenticated
          }),
          onRehydrateStorage: () => (state) => {
            state?.setHasHydrated(true);
          }
        }
      )
    )
  )
);

// Export event emitter for subscribing to auth events
export { authEvents };

// Convenience functions for subscribing to auth events
export const onLogin = (callback) => authEvents.on('login', callback);
export const onLogout = (callback) => authEvents.on('logout', callback);
export const onUserUpdate = (callback) => authEvents.on('userUpdate', callback);
export const onAuthStateChange = (callback) =>
  authEvents.on('stateChange', callback);
