import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationPageProps {
  onSwitchToLogin: () => void;
}

export default function RegistrationPage({ onSwitchToLogin }: RegistrationPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'player',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone number is required';
    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
    return '';
  };

  const validateName = (name: string): string => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const errors: { [key: string]: string } = {};

    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === 'admin' && !formData.adminCode) {
      errors.adminCode = 'Admin Registration Code is required';
    }

    // If there are any errors, display them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone, formData.role, formData.adminCode);
      // Navigate to verification page with email
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-500/50 to-emerald-300/50 blur-lg" aria-hidden="true"></div>
            <img
              src="/assets/logo.jpg"
              alt="App logo"
              className="relative w-20 h-20 rounded-full object-cover ring-2 ring-green-600 shadow-lg bg-white p-0.5"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join SCC Academy of Cricket</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Sign Up</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="flex space-x-2 p-1 bg-gray-50 rounded-lg">
              {['player', 'coach', 'admin'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role }))}
                  className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${formData.role === role
                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Admin Code Field - Only show if Admin is selected */}
            {formData.role === 'admin' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Registration Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                  <input
                    type="text"
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50 ${fieldErrors.adminCode ? 'border-red-500' : 'border-green-200'
                      }`}
                    placeholder="Enter secret code"
                    required={formData.role === 'admin'}
                  />
                </div>
                {fieldErrors.adminCode && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.adminCode}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="+94 77 123 4567"
                  required
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
              {formData.password && !validatePassword(formData.password) && (
                <p className="mt-1 text-sm text-green-600">✓ Strong password</p>
              )}
              {formData.password && !fieldErrors.password && validatePassword(formData.password) && (
                <p className="mt-1 text-sm text-gray-500 text-xs">
                  Password must be 8+ characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-sm text-green-600">✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div >
    </div >
  );
}