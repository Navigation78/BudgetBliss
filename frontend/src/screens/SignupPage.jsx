import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validatePhone = (phone) => {
    // M-Pesa Kenya phone validation: starts with 254 or 0, followed by 7/1 and 8 digits
    const kenyanFormat = /^(?:254|\+254|0)?(7|1)[0-9]{8}$/;
    return kenyanFormat.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        break;
      case 'email':
        if (value && !validateEmail(value)) error = 'Please enter a valid email';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required for M-Pesa';
        else if (!validatePhone(value)) error = 'Invalid M-Pesa phone number (e.g., 0712345678 or 254712345678)';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      username: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    };
    setTouched(allTouched);

    // Validate all fields
    const isUsernameValid = validateField('username', formData.username);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('phone', formData.phone);
    const isPasswordValid = validateField('password', formData.password);
    const isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);

    if (isUsernameValid && isEmailValid && isPhoneValid && isPasswordValid && isConfirmPasswordValid) {
      console.log('Form submitted:', formData);
      alert('Signup successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const goToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up with M-Pesa integration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => handleBlur('username')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                touched.username && errors.username
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-green-200'
              }`}
              placeholder="Enter username"
            />
            {touched.username && errors.username && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                touched.email && errors.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-green-200'
              }`}
              placeholder="email@example.com"
            />
            {touched.email && errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                touched.phone && errors.phone
                  ? 'border-red-500 focus:ring-red-200'
                  : touched.phone && !errors.phone && formData.phone
                  ? 'border-green-500 focus:ring-green-200'
                  : 'border-gray-300 focus:ring-green-200'
              }`}
              placeholder="0712345678 or 254712345678"
            />
            {touched.phone && errors.phone && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.phone}</span>
              </div>
            )}
            {touched.phone && !errors.phone && formData.phone && (
              <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                <CheckCircle size={14} />
                <span>Valid M-Pesa number</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition pr-10 ${
                  touched.password && errors.password
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-green-200'
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition pr-10 ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-200'
                    : touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword
                    ? 'border-green-500 focus:ring-green-200'
                    : 'border-gray-300 focus:ring-green-200'
                }`}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle size={14} />
                <span>{errors.confirmPassword}</span>
              </div>
            )}
            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
              <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                <CheckCircle size={14} />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <button
            onClick={goToLogin}
            className="text-green-600 hover:text-green-700 font-medium underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}