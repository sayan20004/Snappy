import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasswordReqs, setShowPasswordReqs] = useState(false);

  // Password validation
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return requirements;
  };

  const passwordReqs = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordReqs).every(Boolean);

  // Name validation
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens and apostrophes';
    }
    return '';
  };

  // Email validation
  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('🎉 Account created successfully! Welcome to Snappy Todo!', {
        duration: 4000,
        icon: '✅',
      });
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 10);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      toast.error(errorMessage, { duration: 5000 });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    
    if (nameError || emailError || !isPasswordValid) {
      setErrors({
        name: nameError,
        email: emailError,
        password: !isPasswordValid ? 'Password does not meet requirements' : '',
      });
      setTouched({ name: true, email: true, password: true });
      
      if (nameError) toast.error(nameError);
      else if (emailError) toast.error(emailError);
      else if (!isPasswordValid) toast.error('Password does not meet all requirements');
      
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate on blur
    if (name === 'name') {
      const error = validateName(value);
      setErrors({ ...errors, name: error });
    } else if (name === 'email') {
      const error = validateEmail(value);
      setErrors({ ...errors, email: error });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚡️ Snappy Todo
          </h1>
          <p className="text-gray-600">Get started in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`input ${errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="John Doe"
              required
              autoFocus
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.name}
              </p>
            )}
            {!errors.name && touched.name && formData.name && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <span>✓</span> Looks good!
              </p>
            )}
          </div>

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
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.email}
              </p>
            )}
            {!errors.email && touched.email && formData.email && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <span>✓</span> Valid email
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
              onFocus={() => setShowPasswordReqs(true)}
              className={`input ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Create a strong password"
              required
            />
            
            {/* Password Requirements */}
            {(showPasswordReqs || formData.password) && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                <ul className="space-y-1 text-xs">
                  <li className={`flex items-center gap-2 ${passwordReqs.length ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordReqs.length ? '✓' : '○'}</span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${passwordReqs.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordReqs.uppercase ? '✓' : '○'}</span>
                    One uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center gap-2 ${passwordReqs.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordReqs.lowercase ? '✓' : '○'}</span>
                    One lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center gap-2 ${passwordReqs.number ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordReqs.number ? '✓' : '○'}</span>
                    One number (0-9)
                  </li>
                  <li className={`flex items-center gap-2 ${passwordReqs.special ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordReqs.special ? '✓' : '○'}</span>
                    One special character (!@#$%^&*)
                  </li>
                </ul>
                {isPasswordValid && (
                  <p className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                    <span>🎉</span> Strong password!
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="btn btn-primary w-full"
          >
            {registerMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
