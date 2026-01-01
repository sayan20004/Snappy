import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`👋 Welcome back, ${data.user.name}!`, {
        duration: 3000,
        icon: '✨',
      });
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 10);
    },
    onError: (error) => {
      console.error('Login error:', error);
      const status = error.response?.status;
      let errorMessage = 'Login failed. Please try again.';
      
      if (status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { duration: 5000 });
    },
  });

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      setTouched({ email: true, password: true });
      
      if (emailError) toast.error(emailError);
      else if (passwordError) toast.error(passwordError);
      
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    if (name === 'email') {
      const error = validateEmail(value);
      setErrors({ ...errors, email: error });
    } else if (name === 'password') {
      const error = validatePassword(value);
      setErrors({ ...errors, password: error });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚡️ Snappy Todo
          </h1>
          <p className="text-gray-600">Lightning-fast task management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="your@email.com"
              required
              autoFocus
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
              required
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn btn-primary w-full"
          >
            {loginMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
