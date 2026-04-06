import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../assets/api';
import { Eye, EyeOff, Mail, Lock, User, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'bg-gray-300' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    
    const strength = [
      { score: 0, label: 'None', color: 'bg-gray-300' },
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500' },
      { score: 3, label: 'Good', color: 'bg-blue-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
      { score: 5, label: 'Very Strong', color: 'bg-green-600' }
    ];
    return strength[score];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on field change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Account created! Redirecting...');
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 sm:px-8 py-8 sm:py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-40 h-40 bg-white/20 rounded-full -top-20 -left-20"></div>
              <div className="absolute w-40 h-40 bg-white/20 rounded-full -bottom-20 -right-20"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Join MoneyMap</h1>
              <p className="text-teal-100 text-xs sm:text-sm font-medium">Start your financial journey today</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 sm:py-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {success && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                <span className="text-xs sm:text-sm font-medium">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0">!</div>
                <span className="text-xs sm:text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Full Name field */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="John Doe"                 
                  required
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600"><span>⚠</span> {errors.name}</p>}
            </div>

            {/* Email field */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-teal-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-0 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600"><span>⚠</span> {errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="mb-4 sm:mb-5">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-teal-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-0 transition-all ${errors.password ? 'border-red-300' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600"><span>⚠</span> {errors.password}</p>}

              {formData.password && (
                <div className="mt-2 sm:mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-bold ${passwordStrength.score <= 1 ? 'text-red-600' : passwordStrength.score === 2 ? 'text-yellow-600' : passwordStrength.score === 3 ? 'text-blue-600' : 'text-green-600'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-teal-600" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-50 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-0 transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600"><span>⚠</span> {errors.confirmPassword}</p>}

              {formData.password && formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <><Check className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600 font-medium">Passwords match</span></>
                  ) : (
                    <><X className="w-4 h-4 text-red-500" /><span className="text-xs text-red-600 font-medium">Passwords don't match</span></>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Creating...</span></> 
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 px-6 sm:px-8 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">Already registered?</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6">By creating an account, you agree to our Terms & Conditions</p>
      </div>
    </div>
  );
};

export default Signup;